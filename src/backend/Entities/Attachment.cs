using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Represents an attachment associated with a comment.
/// </summary>
public class Attachment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    public string FileName { get; set; }
    public byte[] FileContent { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime DeletedAt { get; set; } = DateTime.MinValue;

    public Guid UploadedById { get; set; }
    public virtual User UploadedBy { get; set; }

    public Guid CommentId { get; set; }
    public virtual Comment Comment { get; set; }
    
    public Guid? IssueId { get; set; }
    public virtual Issue Issue { get; set; }
}