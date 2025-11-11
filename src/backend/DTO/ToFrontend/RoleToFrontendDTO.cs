public class RoleToFrontendDTO
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public bool IsDefault { get; set; } = false;
    public bool IsAdmin { get; set; } = false;
    public bool IsSupport { get; set; } = false;

}