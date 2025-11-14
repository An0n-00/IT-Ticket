public class AttachmentToFrontendDTO
{
    public Guid Id { get; set; }
    public string FileName { get; set; }
    public byte[] FileContent { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.Now;
    public bool IsDeleted { get; set; } = false;
    public DateTime DeletedAt { get; set; } = DateTime.MinValue;
    public Guid UploadedById { get; set; }
    public Guid CommentId { get; set; }
    public Guid? IssueId { get; set; }
}