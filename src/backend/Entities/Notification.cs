using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// This class represents a notification entity in the system.
/// </summary>
public class Notification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public Guid? UserId { get; set; }
    public virtual User User { get; set; }

    /// <summary>
    /// null if the notification is not related to an issue.
    /// </summary>
    public Guid? IssueId { get; set; }
    public virtual Issue Issue { get; set; }
}