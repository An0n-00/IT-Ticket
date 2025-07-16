public class CommentDTO
{
    public string Content { get; set; } = null!;
    public Guid IssueId { get; set; }
    public Guid? ParentCommentId { get; set; } = null;
    public List<Guid> Attachments { get; set; } = [];
}