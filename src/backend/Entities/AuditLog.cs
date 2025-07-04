using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// Represents a log entry for auditing actions performed on issues or by users.
/// </summary>
public class AuditLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Action { get; set; }
    public string Details { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Guid? UserId { get; set; }
    public virtual User User { get; set; }

    public Guid? IssueId { get; set; }
    public virtual Issue Issue { get; set; }
}