namespace Sastagram.DTOs;

// ============ AUTH DTOs ============
public record RegisterRequest(
    string Username,
    string Email,
    string Password,
    string? FullName
);

public record LoginRequest(
    string UsernameOrEmail,
    string Password
);

public record AuthResponse(
    string Token,
    UserDto User
);

// ============ USER DTOs ============
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsPrivate { get; set; }
    public bool IsVerified { get; set; }
    public int PostsCount { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowing { get; set; }
    public bool IsFollowedBy { get; set; }
    public bool IsFollowPending { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UserSummaryDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsVerified { get; set; }
    public bool IsFollowing { get; set; }
}

public record UpdateProfileRequest(
    string? FullName,
    string? Bio,
    bool? IsPrivate
);

// ============ POST DTOs ============
public class PostDto
{
    public int Id { get; set; }
    public UserSummaryDto User { get; set; } = null!;
    public string? Caption { get; set; }
    public string? Location { get; set; }
    public List<PostMediaDto> MediaItems { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }
    public bool IsLiked { get; set; }
    public bool IsSaved { get; set; }
    public bool CommentsDisabled { get; set; }
    public bool LikesHidden { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PostMediaDto
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public int Order { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}

public record CreatePostRequest(
    string? Caption,
    string? Location,
    bool CommentsDisabled = false,
    bool LikesHidden = false
);

// ============ COMMENT DTOs ============
public class CommentDto
{
    public int Id { get; set; }
    public UserSummaryDto User { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public int LikesCount { get; set; }
    public bool IsLiked { get; set; }
    public int RepliesCount { get; set; }
    public List<CommentDto> Replies { get; set; } = new();
    public int? ParentCommentId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record CreateCommentRequest(
    string Text,
    int? ParentCommentId = null
);

// ============ STORY DTOs ============
public class StoryDto
{
    public int Id { get; set; }
    public UserSummaryDto User { get; set; } = null!;
    public string MediaUrl { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public string? Caption { get; set; }
    public int ViewsCount { get; set; }
    public bool HasViewed { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
}

public class StoryGroupDto
{
    public UserSummaryDto User { get; set; } = null!;
    public List<StoryDto> Stories { get; set; } = new();
    public bool HasUnviewed { get; set; }
}

// ============ NOTIFICATION DTOs ============
public class NotificationDto
{
    public int Id { get; set; }
    public UserSummaryDto? Actor { get; set; }
    public string Type { get; set; } = string.Empty;
    public int? PostId { get; set; }
    public string? PostThumbnailUrl { get; set; }
    public int? CommentId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ============ PAGINATION ============
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public bool HasMore { get; set; }
}
