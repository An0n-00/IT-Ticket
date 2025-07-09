using Microsoft.EntityFrameworkCore;

public static class Mapper
{
    public static UserToFrontendDTO ToUserDto(Guid userId, Context context)
    {
        var userToMap = context.Users
            .Include(u => u.AuditLogs)
            .Include(u => u.Issues)
            .Include(u => u.Role)
            .FirstOrDefault(u => u.Id == userId);
        return new UserToFrontendDTO
        {
            Id = userToMap!.Id,
            Username = userToMap.Username,
            Firstname = userToMap.Firstname!,
            Lastname = userToMap.Lastname!,
            Email = userToMap.Email,
            RoleId = userToMap.Role.Id,
            AuditLogs = userToMap.AuditLogs?.Select(a => a.Id).ToList() ?? [],
            Issues = userToMap.Issues?.Select(i => i.Id).ToList() ?? [],
            CreatedAt = userToMap.CreatedAt,
            IsDeleted = userToMap.IsDeleted,
            IsSuspended = userToMap.IsSuspended,
            DeletedAt = userToMap.DeletedAt,
            SuspendedAt = userToMap.SuspendedAt
        };
    }
}