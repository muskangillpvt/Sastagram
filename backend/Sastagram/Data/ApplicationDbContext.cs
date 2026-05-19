using Microsoft.EntityFrameworkCore;
using Sastagram.Models;

namespace Sastagram.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<PostMedia> PostMedia => Set<PostMedia>();
    public DbSet<PostTag> PostTags => Set<PostTag>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<CommentLike> CommentLikes => Set<CommentLike>();
    public DbSet<Like> Likes => Set<Like>();
    public DbSet<Follow> Follows => Set<Follow>();
    public DbSet<Story> Stories => Set<Story>();
    public DbSet<StoryView> StoryViews => Set<StoryView>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<SavedPost> SavedPosts => Set<SavedPost>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // Post
        modelBuilder.Entity<Post>(e =>
        {
            e.HasOne(p => p.User)
             .WithMany(u => u.Posts)
             .HasForeignKey(p => p.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // PostMedia
        modelBuilder.Entity<PostMedia>(e =>
        {
            e.HasOne(pm => pm.Post)
             .WithMany(p => p.MediaItems)
             .HasForeignKey(pm => pm.PostId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(pm => pm.MediaType).HasConversion<string>();
        });

        // Comment
        modelBuilder.Entity<Comment>(e =>
        {
            e.HasOne(c => c.Post)
             .WithMany(p => p.Comments)
             .HasForeignKey(c => c.PostId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.User)
             .WithMany(u => u.Comments)
             .HasForeignKey(c => c.UserId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(c => c.ParentComment)
             .WithMany(c => c.Replies)
             .HasForeignKey(c => c.ParentCommentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // CommentLike
        modelBuilder.Entity<CommentLike>(e =>
        {
            e.HasIndex(cl => new { cl.CommentId, cl.UserId }).IsUnique();
        });

        // Like
        modelBuilder.Entity<Like>(e =>
        {
            e.HasIndex(l => new { l.PostId, l.UserId }).IsUnique();

            e.HasOne(l => l.Post)
             .WithMany(p => p.Likes)
             .HasForeignKey(l => l.PostId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(l => l.User)
             .WithMany(u => u.Likes)
             .HasForeignKey(l => l.UserId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Follow
        modelBuilder.Entity<Follow>(e =>
        {
            e.HasIndex(f => new { f.FollowerId, f.FollowingId }).IsUnique();

            e.HasOne(f => f.Follower)
             .WithMany(u => u.Following)
             .HasForeignKey(f => f.FollowerId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(f => f.Following)
             .WithMany(u => u.Followers)
             .HasForeignKey(f => f.FollowingId)
             .OnDelete(DeleteBehavior.Restrict);

            e.Property(f => f.Status).HasConversion<string>();
        });

        // Story
        modelBuilder.Entity<Story>(e =>
        {
            e.HasOne(s => s.User)
             .WithMany(u => u.Stories)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.Cascade);
            e.Property(s => s.MediaType).HasConversion<string>();
        });

        // StoryView
        modelBuilder.Entity<StoryView>(e =>
        {
            e.HasIndex(sv => new { sv.StoryId, sv.ViewerId }).IsUnique();
        });

        // Notification
        modelBuilder.Entity<Notification>(e =>
        {
            e.HasOne(n => n.Recipient)
             .WithMany(u => u.Notifications)
             .HasForeignKey(n => n.RecipientId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(n => n.Actor)
             .WithMany()
             .HasForeignKey(n => n.ActorId)
             .OnDelete(DeleteBehavior.SetNull);

            e.Property(n => n.Type).HasConversion<string>();
        });

        // SavedPost
        modelBuilder.Entity<SavedPost>(e =>
        {
            e.HasIndex(sp => new { sp.UserId, sp.PostId }).IsUnique();
        });
    }
}
