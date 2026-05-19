using System.ComponentModel.DataAnnotations;

namespace Sastagram.Models;

public class Post
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [MaxLength(2200)]
    public string? Caption { get; set; }

    public string? Location { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public bool IsArchived { get; set; } = false;
    public bool CommentsDisabled { get; set; } = false;
    public bool LikesHidden { get; set; } = false;

    // Navigation
    public ICollection<PostMedia> MediaItems { get; set; } = new List<PostMedia>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<PostTag> Tags { get; set; } = new List<PostTag>();
    public ICollection<SavedPost> SavedByUsers { get; set; } = new List<SavedPost>();
}

public class PostMedia
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;

    public string Url { get; set; } = string.Empty;
    public string PublicId { get; set; } = string.Empty;
    public MediaType MediaType { get; set; }
    public int Order { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}

public enum MediaType
{
    Image,
    Video
}

public class PostTag
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;

    public string Tag { get; set; } = string.Empty;
}
