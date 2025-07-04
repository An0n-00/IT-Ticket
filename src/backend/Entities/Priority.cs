using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; 

/// <summary>
/// Represents a priority entity that can be used to categorize issues.
/// </summary>
public class Priority
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Color { get; set; }
    
}