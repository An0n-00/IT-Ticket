using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// This class represents a User entity in the system.
/// </summary>
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }

    public string Username { get; set; }
    public string? Firstname { get; set; }
    public string? Lastname { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string Salt { get; set; } = "";

    public Guid RoleId { get; set; }
    public virtual Role Role { get; set; }
    
    public virtual ICollection<Issue>? Issues { get; set; }
    public virtual ICollection<AuditLog>? AuditLogs { get; set; }
}