public class CommentToFrontendDTO
{
    public Guid Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.MinValue;
    public bool IsDeleted { get; set; } 
    public DateTime DeletedAt { get; set; } = DateTime.MinValue;
    public Guid UserId { get; set; }
    public Guid IssueId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public virtual List<Guid> Replies { get; set; } = [];
    public virtual List<Guid> Attachments { get; set; } = [];
}