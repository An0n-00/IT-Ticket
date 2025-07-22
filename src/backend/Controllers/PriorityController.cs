using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// PriorityController handles API operations related to priorities.
/// </summary>
/// <param name="context">The database context used for accessing priority-related data.</param>
/// <remarks>
/// This controller provides endpoints for retrieving priority-related data.
/// NOTE: THE CONTROLLER ONLY ALLOWS RETRIEVING. ADMINS CANNOT CREATE NEW PRIORITIES UNLESS WITH DIRECT DATABASE ACCESS.
/// </remarks>
/// <returns>
/// 401: When requested without a valid Bearer token.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class PriorityController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    /// <summary>
    /// Get all possible Priorities from the database
    /// </summary>
    /// <remarks>
    /// Route: /api/priority
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Guids for all possible priorities
    /// 400: If an error occurs.
    /// </returns>
    [HttpGet]
    public IActionResult GetPriorities()
    {
        try
        {
            var priorities = _context.Priorities.Select(p=> p.Id).ToList();
            
            return Ok(priorities);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.PriorityController_GetAllPriorities));
        }
    }
    
    /// <summary>
    /// Get a single priority by its ID
    /// </summary>
    /// <param name="id">The ID of the Priority to get</param>
    /// <remarks>
    /// Route: /api/priority/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a priority in its DTO format
    /// 400: If the ID is invalid or if an error occurs while retrieving the Notifications.
    /// </returns>
    [HttpGet("{id:guid}")]
    public IActionResult GetPriority(Guid id)
    {
        try
        {
            var priority = context.Priorities.FirstOrDefault(p => p.Id == id);

            if (priority == null)
            {
                return NotFound(new ControlledException("Priority not found", ECode.PriorityController_GetPriorityById));
            }

            
            return Ok(Mapper.ToPriorityDto(id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.PriorityController_GetPriorityById));
        }
    }

}