using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing audit logs.
/// This controller is only responsible for getting audit logs.
/// It does not handle audit log creation or deletion.
/// </summary>
/// <param name="context">The database context used for audit log management.</param>
/// <remarks>
/// This controller is designed to provide audit log-related functionalities.
/// It is not intended for creating or deleting audit logs.
/// It is secured with authorization to ensure that only authenticated users can access the audit log information.
/// </remarks>
/// <returns>
/// 401: Unauthorized access if the user is not authenticated.
/// 404: Not found if the audit log does not exist.
/// 500: Internal server error if an unexpected error occurs.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class AuditLogController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    /// <summary>
    /// Get all audit logs from the database as an array of Guids
    /// Admins will see all audit logs, while users will see logs referencing their own user ID OR issues they are part of (assigned/created).
    /// </summary>
    /// <remarks>
    /// Route: /api/auditlog
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Guids for all audit logs
    /// 400: If an error occurs.
    /// 500: Internal server error if an unexpected error occurs.
    /// </returns>
    [HttpGet]
    public IActionResult GetAllAuditLogs()
    {
        try
        {
            var user = HelperClass.ParseUser(User, _context);

            var auditLogs = _context.AuditLogs
                .Where(log => log.UserId == user.Id ||
                              log.Issue.AssignedToId == user.Id ||
                              user.Role.IsAdmin)
                .Select(log => log.Id)
                .ToList();

            if (auditLogs == null || !auditLogs.Any())
            {
                return NotFound(new ControlledException("No audit logs found", ECode.AuditLogController_GetAllAuditLogs));
            }
            return Ok(auditLogs);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.AuditLogController_GetAllAuditLogs));
        }
    }

    /// <summary>
    /// Get an audit log by its ID
    /// </summary>
    /// <remarks>
    /// Route: /api/auditlog/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The ID of the audit log to retrieve</param>
    /// <returns>
    /// 200: Returns the audit log if found
    /// 401: Unauthorized access if the user is not allowed to view the audit log
    /// 404: Not found if the audit log does not exist
    /// 500: Internal server error if an unexpected error occurs
    /// </returns>
    [HttpGet("{id}")]
    public IActionResult GetAuditLogById(Guid id)
    {
        try
        {
            var user = HelperClass.ParseUser(User, _context);

            var auditLog = _context.AuditLogs
                .FirstOrDefault(log => log.Id == id &&
                                       (log.UserId == user.Id ||
                                        log.Issue.AssignedToId == user.Id ||
                                        user.Role.IsAdmin));

            if (auditLog == null)
            {
                return NotFound(new ControlledException("Audit log not found", ECode.AuditLogController_GetAuditLogById));
            }
            return Ok(Mapper.ToAuditLogDto(auditLog.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.AuditLogController_GetAuditLogById));
        }
    }
}
