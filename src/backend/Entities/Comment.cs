using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Represents a Comment entity
/// </summary>
public class Comment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Guid UserId { get; set; }
    public virtual User User { get; set; }

    public Guid IssueId { get; set; }
    public virtual Issue Issue { get; set; }

    public Guid? ParentCommentId { get; set; }
    public virtual Comment ParentComment { get; set; }
    public virtual ICollection<Comment> Replies { get; set; }
    
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}