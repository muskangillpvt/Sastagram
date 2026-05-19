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
[Route("api/posts/{postId:int}/comments")]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public CommentsController(ApplicationDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<CommentDto>>> GetComments(int postId)
    {
        var comments = await _db.Comments
            .Where(c => c.PostId == postId && c.ParentCommentId == null)
            .Include(c => c.User)
            .Include(c => c.Replies).ThenInclude(r => r.User)
            .Include(c => c.Likes)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        var likedIds = await _db.CommentLikes
            .Where(cl => cl.UserId == CurrentUserId)
            .Select(cl => cl.CommentId)
            .ToListAsync();

        return comments.Select(c => MapCommentDto(c, likedIds)).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<CommentDto>> AddComment(int postId, [FromBody] CreateCommentRequest request)
    {
        var post = await _db.Posts.FindAsync(postId);
        if (post == null) return NotFound();

        var comment = new Comment
        {
            PostId = postId,
            UserId = CurrentUserId,
            Text = request.Text,
            ParentCommentId = request.ParentCommentId
        };

        _db.Comments.Add(comment);

        if (post.UserId != CurrentUserId)
        {
            _db.Notifications.Add(new Notification
            {
                RecipientId = post.UserId,
                ActorId = CurrentUserId,
                Type = request.ParentCommentId.HasValue ? NotificationType.CommentReply : NotificationType.Comment,
                PostId = postId,
                CommentId = comment.Id
            });
        }

        await _db.SaveChangesAsync();

        await _db.Entry(comment).Reference(c => c.User).LoadAsync();
        return MapCommentDto(comment, new List<int>());
    }

    [HttpDelete("{commentId:int}")]
    public async Task<IActionResult> DeleteComment(int postId, int commentId)
    {
        var comment = await _db.Comments.FindAsync(commentId);
        if (comment == null || comment.PostId != postId) return NotFound();

        var post = await _db.Posts.FindAsync(postId);
        if (comment.UserId != CurrentUserId && post?.UserId != CurrentUserId) return Forbid();

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{commentId:int}/like")]
    public async Task<IActionResult> LikeComment(int postId, int commentId)
    {
        var existing = await _db.CommentLikes.FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == CurrentUserId);
        if (existing != null) return BadRequest(new { message = "Already liked" });

        _db.CommentLikes.Add(new CommentLike { CommentId = commentId, UserId = CurrentUserId });
        await _db.SaveChangesAsync();
        return Ok(new { liked = true });
    }

    [HttpDelete("{commentId:int}/like")]
    public async Task<IActionResult> UnlikeComment(int postId, int commentId)
    {
        var like = await _db.CommentLikes.FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == CurrentUserId);
        if (like == null) return BadRequest(new { message = "Not liked" });

        _db.CommentLikes.Remove(like);
        await _db.SaveChangesAsync();
        return Ok(new { liked = false });
    }

    private static CommentDto MapCommentDto(Comment comment, List<int> likedIds) => new()
    {
        Id = comment.Id,
        User = new UserSummaryDto { Id = comment.User.Id, Username = comment.User.Username, FullName = comment.User.FullName, ProfilePictureUrl = comment.User.ProfilePictureUrl, IsVerified = comment.User.IsVerified },
        Text = comment.Text,
        LikesCount = comment.Likes?.Count ?? 0,
        IsLiked = likedIds.Contains(comment.Id),
        RepliesCount = comment.Replies?.Count ?? 0,
        Replies = comment.Replies?.Select(r => MapCommentDto(r, likedIds)).ToList() ?? new(),
        ParentCommentId = comment.ParentCommentId,
        CreatedAt = comment.CreatedAt
    };
}

// ===== STORIES CONTROLLER =====
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StoriesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IMediaService _mediaService;

    public StoriesController(ApplicationDbContext db, IMediaService mediaService)
    {
        _db = db;
        _mediaService = mediaService;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<StoryGroupDto>>> GetStories()
    {
        var followingIds = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId && f.Status == FollowStatus.Accepted)
            .Select(f => f.FollowingId)
            .ToListAsync();

        followingIds.Add(CurrentUserId);

        var stories = await _db.Stories
            .Where(s => followingIds.Contains(s.UserId) && s.ExpiresAt > DateTime.UtcNow)
            .Include(s => s.User)
            .Include(s => s.Views)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        var viewedIds = await _db.StoryViews
            .Where(sv => sv.ViewerId == CurrentUserId)
            .Select(sv => sv.StoryId)
            .ToListAsync();

        var grouped = stories
            .GroupBy(s => s.UserId)
            .Select(g => new StoryGroupDto
            {
                User = new UserSummaryDto
                {
                    Id = g.First().User.Id,
                    Username = g.First().User.Username,
                    FullName = g.First().User.FullName,
                    ProfilePictureUrl = g.First().User.ProfilePictureUrl,
                    IsVerified = g.First().User.IsVerified
                },
                Stories = g.Select(s => new StoryDto
                {
                    Id = s.Id,
                    User = new UserSummaryDto { Id = s.User.Id, Username = s.User.Username, FullName = s.User.FullName, ProfilePictureUrl = s.User.ProfilePictureUrl, IsVerified = s.User.IsVerified },
                    MediaUrl = s.MediaUrl,
                    MediaType = s.MediaType.ToString(),
                    Caption = s.Caption,
                    ViewsCount = s.Views.Count,
                    HasViewed = viewedIds.Contains(s.Id),
                    CreatedAt = s.CreatedAt,
                    ExpiresAt = s.ExpiresAt
                }).ToList(),
                HasUnviewed = g.Any(s => !viewedIds.Contains(s.Id))
            })
            .OrderByDescending(g => g.HasUnviewed)
            .ToList();

        return grouped;
    }

    [HttpPost]
    public async Task<ActionResult<StoryDto>> CreateStory([FromForm] string? caption, IFormFile media)
    {
        var isVideo = media.ContentType.StartsWith("video/");
        string url, publicId;
        if (isVideo)
        {
            (url, publicId) = await _mediaService.UploadVideoAsync(media, "stories");
        }
        else
        {
            (url, publicId, _, _) = await _mediaService.UploadImageAsync(media, "stories");
        }

        var story = new Story
        {
            UserId = CurrentUserId,
            MediaUrl = url,
            PublicId = publicId,
            MediaType = isVideo ? Models.MediaType.Video : Models.MediaType.Image,
            Caption = caption
        };

        _db.Stories.Add(story);
        await _db.SaveChangesAsync();
        await _db.Entry(story).Reference(s => s.User).LoadAsync();

        return new StoryDto
        {
            Id = story.Id,
            User = new UserSummaryDto { Id = story.User.Id, Username = story.User.Username, FullName = story.User.FullName, ProfilePictureUrl = story.User.ProfilePictureUrl },
            MediaUrl = story.MediaUrl,
            MediaType = story.MediaType.ToString(),
            Caption = story.Caption,
            CreatedAt = story.CreatedAt,
            ExpiresAt = story.ExpiresAt
        };
    }

    [HttpPost("{id:int}/view")]
    public async Task<IActionResult> ViewStory(int id)
    {
        var story = await _db.Stories.FindAsync(id);
        if (story == null) return NotFound();

        var existing = await _db.StoryViews.AnyAsync(sv => sv.StoryId == id && sv.ViewerId == CurrentUserId);
        if (!existing)
        {
            _db.StoryViews.Add(new StoryView { StoryId = id, ViewerId = CurrentUserId });
            await _db.SaveChangesAsync();
        }

        return Ok();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteStory(int id)
    {
        var story = await _db.Stories.FindAsync(id);
        if (story == null) return NotFound();
        if (story.UserId != CurrentUserId) return Forbid();

        await _mediaService.DeleteMediaAsync(story.PublicId);
        _db.Stories.Remove(story);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ===== NOTIFICATIONS CONTROLLER =====
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public NotificationsController(ApplicationDbContext db) => _db = db;

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<List<NotificationDto>>> GetNotifications()
    {
        var notifications = await _db.Notifications
            .Where(n => n.RecipientId == CurrentUserId)
            .Include(n => n.Actor)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        var postIds = notifications.Where(n => n.PostId.HasValue).Select(n => n.PostId!.Value).Distinct().ToList();
        var postThumbs = await _db.PostMedia
            .Where(pm => postIds.Contains(pm.PostId) && pm.Order == 0)
            .ToDictionaryAsync(pm => pm.PostId, pm => pm.Url);

        return notifications.Select(n => new NotificationDto
        {
            Id = n.Id,
            Actor = n.Actor == null ? null : new UserSummaryDto { Id = n.Actor.Id, Username = n.Actor.Username, FullName = n.Actor.FullName, ProfilePictureUrl = n.Actor.ProfilePictureUrl },
            Type = n.Type.ToString(),
            PostId = n.PostId,
            PostThumbnailUrl = n.PostId.HasValue && postThumbs.TryGetValue(n.PostId.Value, out var thumb) ? thumb : null,
            CommentId = n.CommentId,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt
        }).ToList();
    }

    [HttpPost("read")]
    public async Task<IActionResult> MarkAllRead()
    {
        var unread = await _db.Notifications.Where(n => n.RecipientId == CurrentUserId && !n.IsRead).ToListAsync();
        unread.ForEach(n => n.IsRead = true);
        await _db.SaveChangesAsync();
        return Ok(new { marked = unread.Count });
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> GetUnreadCount()
    {
        return await _db.Notifications.CountAsync(n => n.RecipientId == CurrentUserId && !n.IsRead);
    }
}
