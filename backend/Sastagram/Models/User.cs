using System.ComponentModel.DataAnnotations;

namespace Sastagram.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(150)]
    public string? FullName { get; set; }

    [MaxLength(300)]
    public string? Bio { get; set; }

    public string? ProfilePictureUrl { get; set; }
    public string? ProfilePicturePublicId { get; set; }

    public bool IsPrivate { get; set; } = false;
    public bool IsVerified { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Follow> Followers { get; set; } = new List<Follow>();
    public ICollection<Follow> Following { get; set; } = new List<Follow>();
    public ICollection<Story> Stories { get; set; } = new List<Story>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<SavedPost> SavedPosts { get; set; } = new List<SavedPost>();
}
