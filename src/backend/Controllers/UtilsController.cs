using Microsoft.AspNetCore.Mvc;

[Route("/")]
[Produces("application/json")]
[ApiController]
public class UtilsController : ControllerBase
{
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "pong" });
    }
    
    [HttpGet("/")]
    public IActionResult Index()
    {
        return Ok(new { message = "The IT-Ticket Backend API is up and running." });
    }
}