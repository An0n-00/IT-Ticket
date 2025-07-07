using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

/// <summary>
/// This class represents a Tag entity in the system.
/// </summary>
public class Tag
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public virtual ICollection<IssueTag> IssueTags { get; set; }
}

/// <summary>
/// This is the many-to-many relationship entity between Issues and Tags. (Because an issue can have multiple tags and a tag can be associated with multiple issues)
/// </summary>
public class IssueTag
{
    public Guid IssueId { get; set; }
    public virtual Issue Issue { get; set; }

    public Guid TagId { get; set; }
    public virtual Tag Tag { get; set; }
}