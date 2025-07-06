using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NuGet.Protocol;

/// <summary>
/// UserController handles API operations related to users including retrieving
/// user information and current user identification. It ensures that only
/// authorized requests are processed.
/// </summary>
/// <remarks>
/// This controller is part of a secure API and requires a valid JWT token for
/// authorization. The authentication middleware ensures access control for endpoints.
/// </remarks>
/// <param name="context">Context for database operations.</param>
/// <returns>
/// 401: If you call any endpoint in this controller without a valid JWT token in the Authorization header.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[Authorize]
[ApiController]
public class UserController(Context context) : ControllerBase
{

    private readonly Context _context = context;

    /// <summary>
    /// This endpoint is used to get the current user's ID.
    /// </summary>
    /// <remarks>
    /// Route: /api/user  
    /// Method: GET  
    /// Consumes: application/json  
    /// Produces: application/json  
    /// </remarks>
    /// <returns>
    /// 200: Returns the current user's ID.
    /// 401: Returns an error message if the user is not authenticated.
    /// </returns>
    [HttpGet]
    public IActionResult GetCurrentUser()
    {
        try
        {
            var userIdMakingRequest = Guid.Parse(User.FindFirstValue(ClaimTypes.SerialNumber) ??
                                                 throw new ControlledException(
                                                     "User ID wasn't found in claims. Something went wrong with the generation of the JWT token.",
                                                     ECode.UserController_GetCurrentUser));
            return Ok(new { id = userIdMakingRequest });
        }
        catch (Exception e)
        {
            return BadRequest(e.ToJson());
        }
    }


    /// <summary>
    /// This endpoint is used to get the information of the given ID.
    /// </summary>
    /// <remarks>
    /// Route: /api/user/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The ID of the user to retrieve.</param>
    /// <returns>
    /// 200: Returns the user information.
    /// 400: Returns an error message if the ID is invalid.
    /// 404: Returns an error message if the user is not found.
    /// </returns> 
    [HttpGet("{id}")]
    public IActionResult GetUserById(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid ID in the path", ECode.UserController_GetUserById));
            }

            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound(new ControlledException("User with the given ID was not found", ECode.UserController_GetUserById));
            }

            return Ok(user.ToDto());
        }
        catch (Exception e)
        {
            return BadRequest(e.ToJson());
        }
    }
    
}