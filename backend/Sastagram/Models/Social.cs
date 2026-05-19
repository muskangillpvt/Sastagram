using System.ComponentModel.DataAnnotations;

namespace Sastagram.Models;

public class Comment
{
    public int Id { get; set; }

    public int PostId { get; set; }
    public Post Post { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public int? ParentCommentId { get; set; }
    public Comment? ParentComment { get; set; }
    public ICollection<Comment> Replies { get; set; } = new List<Comment>();

    [Required, MaxLength(2200)]
    public string Text { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
}

public class CommentLike
{
    public int Id { get; set; }
    public int CommentId { get; set; }
    public Comment Comment { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Like
{
    public int Id { get; set; }

    public int PostId { get; set; }
    public Post Post { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Follow
{
    public int Id { get; set; }

    public int FollowerId { get; set; }
    public User Follower { get; set; } = null!;

    public int FollowingId { get; set; }
    public User Following { get; set; } = null!;

    public FollowStatus Status { get; set; } = FollowStatus.Accepted;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum FollowStatus
{
    Pending,
    Accepted
}

public class Story
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string MediaUrl { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }

    [MaxLength(300)]
    public string? Caption { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);

    public ICollection<StoryView> Views { get; set; } = new List<StoryView>();
}

public class StoryView
{
    public int Id { get; set; }
    public int StoryId { get; set; }
    public Story Story { get; set; } = null!;
    public int ViewerId { get; set; }
    public User Viewer { get; set; } = null!;
    public DateTime ViewedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public int Id { get; set; }

    public int RecipientId { get; set; }
    public User Recipient { get; set; } = null!;

    public int? ActorId { get; set; }
    public User? Actor { get; set; }

    public NotificationType Type { get; set; }

    public int? PostId { get; set; }
    public int? CommentId { get; set; }

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationType
{
    Like,
    Comment,
    Follow,
    FollowRequest,
    Mention,
    CommentLike,
    CommentReply
}

public class SavedPost
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}
