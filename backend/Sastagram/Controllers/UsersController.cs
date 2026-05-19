using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sastagram.Data;
using Sastagram.DTOs;
using Sastagram.Models;
using Sastagram.Services;

namespace Sastagram.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IMediaService _mediaService;

    public UsersController(ApplicationDbContext db, IMediaService mediaService)
    {
        _db = db;
        _mediaService = mediaService;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        return await GetUserProfile(CurrentUserId, CurrentUserId);
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<UserDto>> GetUser(string username)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (user == null) return NotFound();
        return await GetUserProfile(user.Id, CurrentUserId);
    }

    [HttpPut("me")]
    public async Task<ActionResult<UserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (request.FullName != null) user.FullName = request.FullName;
        if (request.Bio != null) user.Bio = request.Bio;
        if (request.IsPrivate.HasValue) user.IsPrivate = request.IsPrivate.Value;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetUserProfile(CurrentUserId, CurrentUserId);
    }

    [HttpPost("me/avatar")]
    public async Task<ActionResult<UserDto>> UploadAvatar(IFormFile file)
    {
        var user = await _db.Users.FindAsync(CurrentUserId);
        if (user == null) return NotFound();

        if (!string.IsNullOrEmpty(user.ProfilePicturePublicId))
            await _mediaService.DeleteMediaAsync(user.ProfilePicturePublicId);

        var (url, publicId, _, _) = await _mediaService.UploadImageAsync(file, "avatars");
        user.ProfilePictureUrl = url;
        user.ProfilePicturePublicId = publicId;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await GetUserProfile(CurrentUserId, CurrentUserId);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<UserSummaryDto>>> Search([FromQuery] string q, [FromQuery] int limit = 20)
    {
        var users = await _db.Users
            .Where(u => u.Username.Contains(q.ToLower()) || (u.FullName != null && u.FullName.ToLower().Contains(q.ToLower())))
            .Take(limit)
            .ToListAsync();

        var currentFollowing = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId && users.Select(u => u.Id).Contains(f.FollowingId))
            .Select(f => f.FollowingId)
            .ToListAsync();

        return users.Select(u => new UserSummaryDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            ProfilePictureUrl = u.ProfilePictureUrl,
            IsVerified = u.IsVerified,
            IsFollowing = currentFollowing.Contains(u.Id)
        }).ToList();
    }

    [HttpGet("{username}/followers")]
    public async Task<ActionResult<List<UserSummaryDto>>> GetFollowers(string username)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (user == null) return NotFound();

        var followers = await _db.Follows
            .Where(f => f.FollowingId == user.Id && f.Status == FollowStatus.Accepted)
            .Include(f => f.Follower)
            .Select(f => f.Follower)
            .ToListAsync();

        var currentFollowing = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        return followers.Select(u => new UserSummaryDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            ProfilePictureUrl = u.ProfilePictureUrl,
            IsVerified = u.IsVerified,
            IsFollowing = currentFollowing.Contains(u.Id)
        }).ToList();
    }

    [HttpGet("{username}/following")]
    public async Task<ActionResult<List<UserSummaryDto>>> GetFollowing(string username)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (user == null) return NotFound();

        var following = await _db.Follows
            .Where(f => f.FollowerId == user.Id && f.Status == FollowStatus.Accepted)
            .Include(f => f.Following)
            .Select(f => f.Following)
            .ToListAsync();

        var currentFollowing = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        return following.Select(u => new UserSummaryDto
        {
            Id = u.Id,
            Username = u.Username,
            FullName = u.FullName,
            ProfilePictureUrl = u.ProfilePictureUrl,
            IsVerified = u.IsVerified,
            IsFollowing = currentFollowing.Contains(u.Id)
        }).ToList();
    }

    [HttpPost("{username}/follow")]
    public async Task<IActionResult> Follow(string username)
    {
        var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (targetUser == null) return NotFound();
        if (targetUser.Id == CurrentUserId) return BadRequest(new { message = "Cannot follow yourself" });

        var existing = await _db.Follows.FirstOrDefaultAsync(f => f.FollowerId == CurrentUserId && f.FollowingId == targetUser.Id);
        if (existing != null) return BadRequest(new { message = "Already following" });

        var follow = new Follow
        {
            FollowerId = CurrentUserId,
            FollowingId = targetUser.Id,
            Status = targetUser.IsPrivate ? FollowStatus.Pending : FollowStatus.Accepted
        };

        _db.Follows.Add(follow);

        // Notification
        var notification = new Notification
        {
            RecipientId = targetUser.Id,
            ActorId = CurrentUserId,
            Type = targetUser.IsPrivate ? NotificationType.FollowRequest : NotificationType.Follow
        };
        _db.Notifications.Add(notification);

        await _db.SaveChangesAsync();
        return Ok(new { status = follow.Status.ToString() });
    }

    [HttpDelete("{username}/follow")]
    public async Task<IActionResult> Unfollow(string username)
    {
        var targetUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (targetUser == null) return NotFound();

        var follow = await _db.Follows.FirstOrDefaultAsync(f => f.FollowerId == CurrentUserId && f.FollowingId == targetUser.Id);
        if (follow == null) return BadRequest(new { message = "Not following" });

        _db.Follows.Remove(follow);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<ActionResult<UserDto>> GetUserProfile(int userId, int currentUserId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound();

        var postsCount = await _db.Posts.CountAsync(p => p.UserId == userId && !p.IsArchived);
        var followersCount = await _db.Follows.CountAsync(f => f.FollowingId == userId && f.Status == FollowStatus.Accepted);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == userId && f.Status == FollowStatus.Accepted);

        var followRecord = await _db.Follows.FirstOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);
        var isFollowedBy = await _db.Follows.AnyAsync(f => f.FollowerId == userId && f.FollowingId == currentUserId && f.Status == FollowStatus.Accepted);

        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Bio = user.Bio,
            ProfilePictureUrl = user.ProfilePictureUrl,
            IsPrivate = user.IsPrivate,
            IsVerified = user.IsVerified,
            PostsCount = postsCount,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            IsFollowing = followRecord?.Status == FollowStatus.Accepted,
            IsFollowPending = followRecord?.Status == FollowStatus.Pending,
            IsFollowedBy = isFollowedBy,
            CreatedAt = user.CreatedAt
        };
    }
}
