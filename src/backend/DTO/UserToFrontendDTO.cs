using System.Collections;

public class UserToFrontendDTO
{
    public Guid Id { get; set; }
    public string Email { get; set; }
    public string Username { get; set; }
    public string Firstname { get; set; }
    public string Lastname { get; set; }
    public Guid RoleId { get; set; }
    public List<Guid> Issues { get; set; } = [];
    public List<Guid> AuditLogs { get; set; } = [];
}