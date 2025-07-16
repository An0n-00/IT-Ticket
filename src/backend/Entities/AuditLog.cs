using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

public class AuditLog
{
    public AuditLog() { }

    public AuditLog(HttpContext httpContext)
    {
        IpAddress = httpContext.Connection.RemoteIpAddress?.ToString();
        UserAgent = httpContext.Request.Headers["User-Agent"];
        RequestPath = httpContext.Request.Path;
        RequestMethod = httpContext.Request.Method;
    }

    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Action { get; set; }
    public string Details { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string RequestPath { get; set; }
    public string RequestMethod { get; set; }
    public bool IsSystemAction { get; set; } = false;
    public int SuspiciousScore { get; set; } = 0;

    public Guid? UserId { get; set; }
    public virtual User User { get; set; }

    public Guid? IssueId { get; set; }
    public virtual Issue Issue { get; set; }
}