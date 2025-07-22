public class AuditLogToFrontendDTO
{
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
    public Guid? IssueId { get; set; }
}