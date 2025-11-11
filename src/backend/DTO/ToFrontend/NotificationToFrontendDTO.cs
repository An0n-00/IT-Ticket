public class NotificationToFrontendDTO
{
    public Guid Id { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; } = DateTime.MinValue;
    public DateTime CreatedAt { get; set; } = DateTime.MinValue;
    public Guid? IssueId { get; set; }
    public Guid UserId { get; set; }
}