using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class Issue
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public Guid UserId { get; set; }
    public virtual User User { get; set; }
    
    public Guid? AssignedToId { get; set; }
    public virtual User AssignedTo { get; set; }
    
    public Guid? StatusId { get; set; }
    public virtual Status Status { get; set; } 
    
    public Guid? PriorityId { get; set; }
    public virtual Priority Priority { get; set; }

    public virtual ICollection<Comment> Comments { get; set; }
    public virtual ICollection<IssueTag> IssueTags { get; set; }
    public virtual ICollection<AuditLog> AuditLogs { get; set; }
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    
}