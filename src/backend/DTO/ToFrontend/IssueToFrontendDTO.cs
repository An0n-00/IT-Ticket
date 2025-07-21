public class IssueToFrontendDTO
{
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime DeletedAt { get; set; }
    public DateTime? LastUpdated { get; set; } = null;
    public Guid UserId { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? StatusId { get; set; }
    public Guid? PriorityId { get; set; }

    public List<Guid>? Comments { get; set; }
    public List<Guid>? IssueTags { get; set; }
    public List<Guid>? AuditLogs { get; set; }
    public List<Guid>? Attachments { get; set; }
    public List<Guid>? Notifications { get; set; }
}