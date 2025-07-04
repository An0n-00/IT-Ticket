using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("/api/[controller]")]
[Produces("application/json")]
[Authorize]
[ApiController]
public class UserController : ControllerBase
{
    /// <summary>
    /// This endpoint is used to get the current user's details.
    /// </summary>
    /// <remarks>
    /// Route: /api/user  
    /// Method: GET  
    /// Consumes: application/json  
    /// Produces: application/json  
    /// </remarks>
    /// <returns>
    /// 200: Returns the current user's details.
    /// 401: Returns an error message if the user is not authenticated.
    /// </returns>
    [HttpGet]
    public IActionResult GetCurrentUser()
    {
        var userId = User.FindFirst("id")?.Value;
        if (userId == null)
        {
            return Unauthorized(new { message = "User is not authenticated." });
        }

        // Here you would typically fetch the user from the database using the userId
        // For demonstration, we return a mock user object
        var user = new
        {
            Id = userId,
            Username = User.Identity.Name,
            Role = User.FindFirst("role")?.Value
        };

        return Ok(user);
    }
}