using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing roles.
/// This controller is only responsible for getting roles.
/// It does not handle role creation or deletion.
/// </summary>
/// <param name="context">The database context used for role management.</param>
/// <remarks>
/// This controller is designed to provide role-related functionalities.
/// It is not intended for creating or deleting roles.
/// It is secured with authorization to ensure that only authenticated users can access the role information.
/// </remarks>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class RoleController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    /// <summary>
    /// Get all possible Roles from the database
    /// </summary>
    /// <remarks>
    /// Route: /api/role
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Guids for all possible roles
    /// 400: If an error occurs.
    /// </returns>
    [HttpGet]
    public IActionResult GetRoles()
    {
        try
        {
            var roles = _context.Roles.Select(r => r.Id).ToList();
            if (roles == null || !roles.Any())
            {
                return NotFound(new ControlledException("No roles found", ECode.RoleController_GetAllRoles));
            }
            return Ok(roles);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.RoleController_GetAllRoles));
        }
    }
    
    /// <summary>
    /// Get a single role by its ID
    /// </summary>
    /// <param name="id">The ID of the Role to get</param>
    /// <remarks>
    /// Route: /api/role/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a role in its DTO format
    /// 400: If the ID is invalid or if an error occurs while retrieving the Notifications.
    /// </returns>
    [HttpGet("{id:guid}")]
    public IActionResult GetRole(Guid id)
    {
        try
        {
            var role = _context.Roles.FirstOrDefault(r => r.Id == id);

            if (role == null)
            {
                return NotFound(new ControlledException("Role not found", ECode.RoleController_GetRole));
            }

            return Ok(Mapper.ToRoleDto(id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.RoleController_GetRole));
        }
    }
}