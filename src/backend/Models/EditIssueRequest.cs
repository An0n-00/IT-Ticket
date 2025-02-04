namespace M295.Models;

public class EditIssueRequest
{
    public string Title { get; set; }
    public string Description { get; set; }
    public string Priority { get; set; }
    public string? Status { get; set; } 
}