using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// Controller for managing tags.
/// This controller is only responsible for getting tags.
/// It does not handle tag creation or deletion.
/// </summary>
/// <param name="context">The database context used for tag management.</param>
/// <remarks>
/// This controller is designed to provide tag-related functionalities.
/// It is not intended for creating or deleting tags.
/// It is secured with authorization to ensure that only authenticated users can access the tag information.
/// </remarks>
/// <returns>
/// 401: Unauthorized access if the user is not authenticated.
/// 404: Not found if the tag does not exist.
/// 500: Internal server error if an unexpected error occurs.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class TagController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    /// <summary>
    /// Get all possible Tags from the database as an array of Guids
    /// </summary>
    /// <remarks>
    /// Route: /api/tag
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Guids for all possible tags
    /// 400: If an error occurs.
    /// </returns>
    [HttpGet]
    public IActionResult GetAllTags()
    {
        try
        {
            var tags = _context.Tags.Select(t => t.Id).ToList();
            if (tags == null || !tags.Any())
            {
                return NotFound(new ControlledException("No tags found", ECode.TagController_GetAllTags));
            }
            return Ok(tags);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.TagController_GetAllTags));
        }
    }

    /// <summary>
    /// Get a tag by its ID
    /// </summary>
    /// <remarks>
    /// Route: /api/tag/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The ID of the tag to retrieve</param>
    /// <returns>
    /// 200: Returns the tag if found
    /// 404: Not found if the tag does not exist
    /// 500: Internal server error if an unexpected error occurs
    /// </returns>
    [HttpGet("{id}")]
    public IActionResult GetTagById(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid tag ID", ECode.TagController_GetTagById));
            }
            var tag = _context.Tags.Find(id);
            if (tag == null)
            {
                return NotFound(new ControlledException("Tag not found", ECode.TagController_GetTagById));
            }
            return Ok(Mapper.ToTagDto(id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.TagController_GetTagById));
        }

    }
}
