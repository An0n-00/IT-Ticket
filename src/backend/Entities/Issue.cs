using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Issue
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime DeletedAt { get; set; } = DateTime.MinValue;
    public DateTime? LastUpdated { get; set; } = DateTime.MinValue;

    public Guid UserId { get; set; }
    public virtual User User { get; set; }

    public Guid? AssignedToId { get; set; }
    public virtual User AssignedTo { get; set; }

    public Guid? StatusId { get; set; }
    public virtual Status Status { get; set; }

    public Guid? PriorityId { get; set; }
    public virtual Priority Priority { get; set; }

    public virtual ICollection<Comment>? Comments { get; set; } = new List<Comment>();
    public virtual ICollection<IssueTag>? IssueTags { get; set; } = new List<IssueTag>();
    public virtual ICollection<AuditLog>? AuditLogs { get; set; } = new List<AuditLog>();
    public virtual ICollection<Attachment>? Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<Notification>? Notifications { get; set; } = new List<Notification>();
}