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
public class PostsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IMediaService _mediaService;

    public PostsController(ApplicationDbContext db, IMediaService mediaService)
    {
        _db = db;
        _mediaService = mediaService;
    }

    private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("feed")]
    public async Task<ActionResult<PagedResult<PostDto>>> GetFeed([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var followingIds = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId && f.Status == FollowStatus.Accepted)
            .Select(f => f.FollowingId)
            .ToListAsync();

        followingIds.Add(CurrentUserId); // include own posts

        var query = _db.Posts
            .Where(p => followingIds.Contains(p.UserId) && !p.IsArchived)
            .OrderByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.User)
            .Include(p => p.MediaItems)
            .Include(p => p.Tags)
            .ToListAsync();

        var postIds = posts.Select(p => p.Id).ToList();

        var likedPostIds = await _db.Likes
            .Where(l => l.UserId == CurrentUserId && postIds.Contains(l.PostId))
            .Select(l => l.PostId)
            .ToListAsync();

        var savedPostIds = await _db.SavedPosts
            .Where(s => s.UserId == CurrentUserId && postIds.Contains(s.PostId))
            .Select(s => s.PostId)
            .ToListAsync();

        var likeCounts = await _db.Likes
            .Where(l => postIds.Contains(l.PostId))
            .GroupBy(l => l.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToListAsync();

        var commentCounts = await _db.Comments
            .Where(c => postIds.Contains(c.PostId))
            .GroupBy(c => c.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToListAsync();

        var dtos = posts.Select(p => MapPostDto(p, likedPostIds, savedPostIds, likeCounts, commentCounts)).ToList();

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            HasMore = page * pageSize < total
        };
    }

    [HttpGet("explore")]
    public async Task<ActionResult<PagedResult<PostDto>>> Explore([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var followingIds = await _db.Follows
            .Where(f => f.FollowerId == CurrentUserId && f.Status == FollowStatus.Accepted)
            .Select(f => f.FollowingId)
            .ToListAsync();

        var query = _db.Posts
            .Where(p => !p.IsArchived && p.UserId != CurrentUserId)
            .OrderByDescending(p => p.Likes.Count * 2 + p.Comments.Count)
            .ThenByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();

        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.User)
            .Include(p => p.MediaItems)
            .Include(p => p.Tags)
            .ToListAsync();

        var postIds = posts.Select(p => p.Id).ToList();

        var likedPostIds = await _db.Likes
            .Where(l => l.UserId == CurrentUserId && postIds.Contains(l.PostId))
            .Select(l => l.PostId)
            .ToListAsync();

        var savedPostIds = await _db.SavedPosts
            .Where(s => s.UserId == CurrentUserId && postIds.Contains(s.PostId))
            .Select(s => s.PostId)
            .ToListAsync();

        var likeCounts = await _db.Likes
            .Where(l => postIds.Contains(l.PostId))
            .GroupBy(l => l.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToListAsync();

        var commentCounts = await _db.Comments
            .Where(c => postIds.Contains(c.PostId))
            .GroupBy(c => c.PostId)
            .Select(g => new { PostId = g.Key, Count = g.Count() })
            .ToListAsync();

        var dtos = posts.Select(p => MapPostDto(p, likedPostIds, savedPostIds, likeCounts, commentCounts)).ToList();

        return new PagedResult<PostDto>
        {
            Items = dtos,
            TotalCount = total,
            Page = page,
            PageSize = pageSize,
            HasMore = page * pageSize < total
        };
    }

    [HttpGet("{username}/posts")]
    public async Task<ActionResult<PagedResult<PostDto>>> GetUserPosts(string username, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower());
        if (user == null) return NotFound();

        var query = _db.Posts
            .Where(p => p.UserId == user.Id && !p.IsArchived)
            .OrderByDescending(p => p.CreatedAt);

        var total = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Include(p => p.User)
            .Include(p => p.MediaItems)
            .Include(p => p.Tags)
            .ToListAsync();

        var postIds = posts.Select(p => p.Id).ToList();
        var likedPostIds = await _db.Likes.Where(l => l.UserId == CurrentUserId && postIds.Contains(l.PostId)).Select(l => l.PostId).ToListAsync();
        var savedPostIds = await _db.SavedPosts.Where(s => s.UserId == CurrentUserId && postIds.Contains(s.PostId)).Select(s => s.PostId).ToListAsync();
        var likeCounts = await _db.Likes.Where(l => postIds.Contains(l.PostId)).GroupBy(l => l.PostId).Select(g => new { PostId = g.Key, Count = g.Count() }).ToListAsync();
        var commentCounts = await _db.Comments.Where(c => postIds.Contains(c.PostId)).GroupBy(c => c.PostId).Select(g => new { PostId = g.Key, Count = g.Count() }).ToListAsync();

        return new PagedResult<PostDto>
        {
            Items = posts.Select(p => MapPostDto(p, likedPostIds, savedPostIds, likeCounts, commentCounts)).ToList(),
            TotalCount = total, Page = page, PageSize = pageSize, HasMore = page * pageSize < total
        };
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PostDto>> GetPost(int id)
    {
        var post = await _db.Posts
            .Include(p => p.User)
            .Include(p => p.MediaItems)
            .Include(p => p.Tags)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        var likedPostIds = await _db.Likes.Where(l => l.UserId == CurrentUserId && l.PostId == id).Select(l => l.PostId).ToListAsync();
        var savedPostIds = await _db.SavedPosts.Where(s => s.UserId == CurrentUserId && s.PostId == id).Select(s => s.PostId).ToListAsync();
        var likeCount = await _db.Likes.CountAsync(l => l.PostId == id);
        var commentCount = await _db.Comments.CountAsync(c => c.PostId == id);

        var likeCounts = new[] { new { PostId = id, Count = likeCount } }.ToList();
        var commentCounts = new[] { new { PostId = id, Count = commentCount } }.ToList();

        return MapPostDto(post, likedPostIds, savedPostIds, likeCounts, commentCounts);
    }

    [HttpPost]
    public async Task<ActionResult<PostDto>> CreatePost([FromForm] CreatePostRequest request, [FromForm] List<IFormFile> media)
    {
        if (media == null || media.Count == 0)
            return BadRequest(new { message = "At least one media file is required" });

        var post = new Post
        {
            UserId = CurrentUserId,
            Caption = request.Caption,
            Location = request.Location,
            CommentsDisabled = request.CommentsDisabled,
            LikesHidden = request.LikesHidden
        };

        // Extract hashtags from caption
        if (!string.IsNullOrEmpty(request.Caption))
        {
            var tags = request.Caption
                .Split(' ')
                .Where(w => w.StartsWith('#'))
                .Select(w => w.TrimStart('#').ToLower())
                .Where(t => t.Length > 0)
                .Distinct()
                .Select(t => new PostTag { Tag = t });

            post.Tags = tags.ToList();
        }

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        for (int i = 0; i < media.Count; i++)
        {
            var file = media[i];
            var isVideo = file.ContentType.StartsWith("video/");

            PostMedia postMedia;
            if (isVideo)
            {
                var (url, publicId) = await _mediaService.UploadVideoAsync(file, "posts");
                postMedia = new PostMedia { PostId = post.Id, Url = url, PublicId = publicId, MediaType = Models.MediaType.Video, Order = i };
            }
            else
            {
                var (url, publicId, width, height) = await _mediaService.UploadImageAsync(file, "posts");
                postMedia = new PostMedia { PostId = post.Id, Url = url, PublicId = publicId, MediaType = Models.MediaType.Image, Order = i, Width = width, Height = height };
            }
            _db.PostMedia.Add(postMedia);
        }

        await _db.SaveChangesAsync();
        return await GetPost(post.Id);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var post = await _db.Posts.Include(p => p.MediaItems).FirstOrDefaultAsync(p => p.Id == id);
        if (post == null) return NotFound();
        if (post.UserId != CurrentUserId) return Forbid();

        foreach (var media in post.MediaItems)
            await _mediaService.DeleteMediaAsync(media.PublicId);

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/like")]
    public async Task<IActionResult> LikePost(int id)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) return NotFound();

        var existing = await _db.Likes.FirstOrDefaultAsync(l => l.PostId == id && l.UserId == CurrentUserId);
        if (existing != null) return BadRequest(new { message = "Already liked" });

        _db.Likes.Add(new Like { PostId = id, UserId = CurrentUserId });

        if (post.UserId != CurrentUserId)
        {
            _db.Notifications.Add(new Notification
            {
                RecipientId = post.UserId,
                ActorId = CurrentUserId,
                Type = NotificationType.Like,
                PostId = id
            });
        }

        await _db.SaveChangesAsync();
        var count = await _db.Likes.CountAsync(l => l.PostId == id);
        return Ok(new { liked = true, count });
    }

    [HttpDelete("{id:int}/like")]
    public async Task<IActionResult> UnlikePost(int id)
    {
        var like = await _db.Likes.FirstOrDefaultAsync(l => l.PostId == id && l.UserId == CurrentUserId);
        if (like == null) return BadRequest(new { message = "Not liked" });

        _db.Likes.Remove(like);
        await _db.SaveChangesAsync();
        var count = await _db.Likes.CountAsync(l => l.PostId == id);
        return Ok(new { liked = false, count });
    }

    [HttpPost("{id:int}/save")]
    public async Task<IActionResult> SavePost(int id)
    {
        var post = await _db.Posts.FindAsync(id);
        if (post == null) return NotFound();

        var existing = await _db.SavedPosts.FirstOrDefaultAsync(s => s.PostId == id && s.UserId == CurrentUserId);
        if (existing != null) return BadRequest(new { message = "Already saved" });

        _db.SavedPosts.Add(new SavedPost { PostId = id, UserId = CurrentUserId });
        await _db.SaveChangesAsync();
        return Ok(new { saved = true });
    }

    [HttpDelete("{id:int}/save")]
    public async Task<IActionResult> UnsavePost(int id)
    {
        var saved = await _db.SavedPosts.FirstOrDefaultAsync(s => s.PostId == id && s.UserId == CurrentUserId);
        if (saved == null) return BadRequest(new { message = "Not saved" });

        _db.SavedPosts.Remove(saved);
        await _db.SaveChangesAsync();
        return Ok(new { saved = false });
    }

    [HttpGet("saved")]
    public async Task<ActionResult<PagedResult<PostDto>>> GetSavedPosts([FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var query = _db.SavedPosts
            .Where(s => s.UserId == CurrentUserId)
            .OrderByDescending(s => s.SavedAt)
            .Select(s => s.Post);

        var total = await query.CountAsync();
        var posts = await query
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Include(p => p.User).Include(p => p.MediaItems).Include(p => p.Tags)
            .ToListAsync();

        var postIds = posts.Select(p => p.Id).ToList();
        var likedPostIds = await _db.Likes.Where(l => l.UserId == CurrentUserId && postIds.Contains(l.PostId)).Select(l => l.PostId).ToListAsync();
        var savedPostIds = await _db.SavedPosts.Where(s => s.UserId == CurrentUserId && postIds.Contains(s.PostId)).Select(s => s.PostId).ToListAsync();
        var likeCounts = await _db.Likes.Where(l => postIds.Contains(l.PostId)).GroupBy(l => l.PostId).Select(g => new { PostId = g.Key, Count = g.Count() }).ToListAsync();
        var commentCounts = await _db.Comments.Where(c => postIds.Contains(c.PostId)).GroupBy(c => c.PostId).Select(g => new { PostId = g.Key, Count = g.Count() }).ToListAsync();

        return new PagedResult<PostDto>
        {
            Items = posts.Select(p => MapPostDto(p, likedPostIds, savedPostIds, likeCounts, commentCounts)).ToList(),
            TotalCount = total, Page = page, PageSize = pageSize, HasMore = page * pageSize < total
        };
    }

    private static PostDto MapPostDto(Post post,
        List<int> likedIds, List<int> savedIds,
        dynamic likeCounts, dynamic commentCounts)
    {
        var likeCount = 0;
        var commentCount = 0;
        foreach (var lc in likeCounts) if (lc.PostId == post.Id) { likeCount = lc.Count; break; }
        foreach (var cc in commentCounts) if (cc.PostId == post.Id) { commentCount = cc.Count; break; }

        return new PostDto
        {
            Id = post.Id,
            User = new UserSummaryDto
            {
                Id = post.User.Id,
                Username = post.User.Username,
                FullName = post.User.FullName,
                ProfilePictureUrl = post.User.ProfilePictureUrl,
                IsVerified = post.User.IsVerified
            },
            Caption = post.Caption,
            Location = post.Location,
            MediaItems = post.MediaItems.OrderBy(m => m.Order).Select(m => new PostMediaDto
            {
                Id = m.Id,
                Url = m.Url,
                MediaType = m.MediaType.ToString(),
                Order = m.Order,
                Width = m.Width,
                Height = m.Height
            }).ToList(),
            Tags = post.Tags.Select(t => t.Tag).ToList(),
            LikesCount = likeCount,
            CommentsCount = commentCount,
            IsLiked = likedIds.Contains(post.Id),
            IsSaved = savedIds.Contains(post.Id),
            CommentsDisabled = post.CommentsDisabled,
            LikesHidden = post.LikesHidden,
            CreatedAt = post.CreatedAt
        };
    }
}
