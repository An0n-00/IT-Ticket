using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing status.
/// This controller is only responsible for getting status.
/// It does not handle status creation or deletion.
/// </summary>
/// <param name="context">The database context used for status management.</param>
/// <remarks>
/// This controller is designed to provide status-related functionalities.
/// It is not intended for creating or deleting status.
/// It is secured with authorization to ensure that only authenticated users can access the status information.
/// </remarks>
/// <returns>
/// 401: Unauthorized access if the user is not authenticated.
/// 404: Not found if the status does not exist.
/// 500: Internal server error if an unexpected error occurs.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class StatusController(Context context) : ControllerBase
{
    private readonly Context _context = context;


    /// <summary>
    /// Get all possible Statuses from the database as an array of Guids
    /// </summary>
    /// <remarks>
    /// Route: /api/status
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Guids for all possible statuses
    /// 400: If an error occurs.
    /// </returns>
    [HttpGet]
    public IActionResult GetStatuses()
    {
        try
        {
            var statuses = _context.Status.Select(s => s.Id).ToList();
            if (statuses == null || !statuses.Any())
            {
                return NotFound(new ControlledException("No statuses found", ECode.StatusController_GetAllStatuses));
            }
            return Ok(statuses);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.StatusController_GetAllStatuses));
        }
    }

    /// <summary>
    /// Get a single status by its ID
    /// </summary>
    /// <param name="id">The ID of the Status to get</param>
    /// <remarks>
    /// Route: /api/status/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns the status with the specified ID
    /// 400: If the ID is invalid or if an error occurs while retrieving the status.
    /// 404: If the status with the specified ID does not exist.
    /// </returns>
    [HttpGet("{id}")]
    public IActionResult GetStatusById(Guid id)
    {
        try
        {
            var status = _context.Status.Find(id);
            if (status == null)
            {
                return NotFound(new ControlledException("Status not found", ECode.StatusController_GetStatusById));
            }
            return Ok(Mapper.ToStatusDto(id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.StatusController_GetStatusById));
        }
    }

}