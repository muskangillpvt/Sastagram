using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sastagram.Data;
using Sastagram.DTOs;
using Sastagram.Models;
using Sastagram.Services;

namespace Sastagram.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(ApplicationDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Username == request.Username.ToLower()))
            return BadRequest(new { message = "Username already taken" });

        if (await _db.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            return BadRequest(new { message = "Email already registered" });

        var user = new User
        {
            Username = request.Username.ToLower().Trim(),
            Email = request.Email.ToLower().Trim(),
            FullName = request.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, MapUserDto(user, 0, 0, 0, false, false, false)));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.Username == request.UsernameOrEmail.ToLower() ||
            u.Email == request.UsernameOrEmail.ToLower());

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid credentials" });

        var followersCount = await _db.Follows.CountAsync(f => f.FollowingId == user.Id && f.Status == FollowStatus.Accepted);
        var followingCount = await _db.Follows.CountAsync(f => f.FollowerId == user.Id && f.Status == FollowStatus.Accepted);
        var postsCount = await _db.Posts.CountAsync(p => p.UserId == user.Id && !p.IsArchived);

        var token = _tokenService.GenerateToken(user);
        return Ok(new AuthResponse(token, MapUserDto(user, postsCount, followersCount, followingCount, false, false, false)));
    }

    private static UserDto MapUserDto(User user, int posts, int followers, int following, bool isFollowing, bool isFollowedBy, bool isPending) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        FullName = user.FullName,
        Bio = user.Bio,
        ProfilePictureUrl = user.ProfilePictureUrl,
        IsPrivate = user.IsPrivate,
        IsVerified = user.IsVerified,
        PostsCount = posts,
        FollowersCount = followers,
        FollowingCount = following,
        IsFollowing = isFollowing,
        IsFollowedBy = isFollowedBy,
        IsFollowPending = isPending,
        CreatedAt = user.CreatedAt
    };
}
