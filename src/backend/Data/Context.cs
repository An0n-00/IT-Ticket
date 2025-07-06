using Microsoft.EntityFrameworkCore;

public class Context : DbContext
{
    public Context(DbContextOptions<Context> options)
        : base(options)
    {
    }

    public DbSet<Issue> Issues { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Role> Roles { get; set; } = null!;
    public DbSet<Status> Status { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<Attachment> Attachments { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<IssueTag> IssueTags { get; set; } = null!;
    public DbSet<AuditLog> AuditLogs { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Priority> Priorities { get; set; } = null!;

    /// <summary>
    /// Configures the relationships and keys for the entities in the context.
    /// </summary>
    /// <param name="modelBuilder">The model builder to configure the entities.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure Issues.AssignedTo relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.AssignedTo)
            .WithMany()
            .HasForeignKey(i => i.AssignedToId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Issues.Users relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.User)
            .WithMany(u => u.Issues)
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Issues.Status relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Status)
            .WithMany()
            .HasForeignKey(i => i.StatusId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configure Issues.Priorities relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Priority)
            .WithMany()
            .HasForeignKey(i => i.PriorityId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure composite primary key for IssueTags
        modelBuilder.Entity<IssueTag>()
            .HasKey(it => new { it.IssueId, it.TagId });

        modelBuilder.Entity<IssueTag>()
            .HasOne(it => it.Issue)
            .WithMany(i => i.IssueTags)
            .HasForeignKey(it => it.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<IssueTag>()
            .HasOne(it => it.Tag)
            .WithMany(t => t.IssueTags)
            .HasForeignKey(it => it.TagId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Comments.Users relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany()
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Comments.Issues relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Issue)
            .WithMany(i => i.Comments)
            .HasForeignKey(c => c.IssueId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Comments.ParentComment relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.ParentComment)
            .WithMany(c => c.Replies)
            .HasForeignKey(c => c.ParentCommentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Attachments.UploadedBy relationship
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.UploadedBy)
            .WithMany()
            .HasForeignKey(a => a.UploadedById)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Attachments.Comments relationship
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Comment)
            .WithMany(c => c.Attachments)
            .HasForeignKey(a => a.CommentId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configure Attachments.Issues relationship
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Issue)
            .WithMany(i => i.Attachments)
            .HasForeignKey(a => a.IssueId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure Notifications.Users relationship
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
        
        // Configure AuditLogs.Users relationship
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.User)
            .WithMany(u => u.AuditLogs)
            .HasForeignKey(al => al.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure AuditLogs.Issues relationship
        modelBuilder.Entity<AuditLog>()
            .HasOne(al => al.Issue)
            .WithMany(i => i.AuditLogs)
            .HasForeignKey(al => al.IssueId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}