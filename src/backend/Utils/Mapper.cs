using System.Collections;

public static class Mapper
{
    public static UserToFrontendDTO ToDto(this User user)
    {
        return new UserToFrontendDTO
        {
            Id = user.Id,
            Username = user.Username,
            Firstname = user.Firstname!,
            Lastname = user.Lastname!,
            Email = user.Email,
            RoleId = user.Role.Id,
            AuditLogs = user.AuditLogs?.Select(a => a.Id).ToList() ?? [],
            Issues = user.Issues?.Select(i => i.Id).ToList() ?? []
        };
    }
}