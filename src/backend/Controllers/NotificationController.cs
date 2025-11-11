using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

/// <summary>
/// NotificationController handles API operations related to notifications.
/// </summary>
/// <param name="context">The database context used for accessing notification-related data.</param>
/// <remarks>
/// This controller provides endpoints for managing notification-related data.
/// Functionalities include creating, retrieving, updating, and deleting notifications.
/// </remarks>
/// <returns>
/// 401: When requested without a valid Bearer token.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class NotificationController(Context context) : ControllerBase
{
    private readonly Context _context = context;
    
    /// <summary>
    /// Gets a Notification by its ID.
    /// </summary>
    /// <param name="id">The guid of the Notification to retrieve.</param>
    /// <remarks>
    /// Route: /api/notification/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns the Notification if found.
    /// 400: If the ID is invalid or if an error occurs while retrieving the Notification.
    /// 404: If the Notification is not found.
    /// </returns>
    [HttpGet("{id:guid}")]
    public IActionResult GetNotification(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                throw new ControlledException("Invalid notification id", ECode.NotificationController_GetNotificationById);
            }

            if (_context.Notifications.Find(id) == null)
            {
                return NotFound(new ControlledException("Notification not found", ECode.NotificationController_GetNotificationById));
            }

            return Ok(Mapper.ToNotificationDto(id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.NotificationController_GetNotificationById));
        }
    }
    
    /// <summary>
    /// Gets all Notifications for the current user.
    /// </summary>
    /// <remarks>
    /// Route: /api/notification
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns a list of Notification ID for the current user.
    /// 400: Returns a Bad Request if any error occurs
    /// </returns>
    [HttpGet]
    public IActionResult GetNotifications()
    {
        try
        {
            var userId = HelperClass.ParseUser(User, _context).Id;

            var notifications = _context.Notifications
                .Where(n => n.UserId == userId)
                .Select(n => n.Id)
                .ToList();
            
            return Ok(notifications);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.NotificationController_GetNotification));
        }
    }
    
    /// <summary>
    /// Read a notification by its ID.
    /// </summary>
    /// <remarks>
    /// Route: /api/notification/{id}
    /// Method: POST
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns the Notification if found and marked as read.
    /// 400: If the ID is invalid or if an error occurs while reading the Notification.
    /// 404: If the Notification is not found.
    /// </returns>
    [HttpPost("{id:guid}")]
    public IActionResult ReadNotification(Guid id, [FromBody] NotificationDTO notificationDto)
    {
        try
        {
            if (id == Guid.Empty)
            {
                throw new ControlledException("Invalid notification id", ECode.NotificationController_ReadNotification);
            }

            var notification = _context.Notifications.Find(id);
            if (notification == null)
            {
                return NotFound(new ControlledException("Notification not found", ECode.NotificationController_ReadNotification));
            }
            
            notification.IsRead = notificationDto.IsRead;
            notification.ReadAt = notificationDto.IsRead ? DateTime.UtcNow : DateTime.MinValue;
            _context.SaveChanges();

            return Ok(Mapper.ToNotificationDto(notification.Id,_context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.NotificationController_ReadNotification));
        }
    }
}