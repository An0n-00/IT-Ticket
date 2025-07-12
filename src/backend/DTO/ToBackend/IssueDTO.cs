public class IssueDTO
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public Guid? AssignedToId { get; set; }
    public Guid? StatusId { get; set; }
    public Guid? PriorityId { get; set; }
}