using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var userIdMakingRequest = HelperClass.ParseUser(User, _context).Id;
            return Ok(new { id = userIdMakingRequest });
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_GetCurrentUser));
        }
    }


    /// <summary>
    /// This endpoint is used to get the information of the given ID. Only returns the information if the information is being requested by the user itself or if the user has administrative privileges.
    /// </summary>
    /// <remarks>
    /// Route: /api/user/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// Authorization: Requires a valid JWT token with user (will only work when it is his information he/she is requesting) or administrative rights.
    /// </remarks>
    /// <param name="id">The ID of the user to retrieve.</param>
    /// <returns>
    /// 200: Returns the user information.
    /// 400: Returns an error message if the ID is invalid.
    /// 404: Returns an error message if the user is not found.
    /// </returns> 
    [HttpGet("{id:guid}")]
    public IActionResult GetUserById(Guid id)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (userMakingRequest.Id != id && !userMakingRequest.Role.IsAdmin)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Access Attempt",
                    Details =
                        $"User {userMakingRequest.Id} attempted to access user information for ID {id} without sufficient permissions.",
                    SuspiciousScore =
                        2 // This will only be triggered if someone tries to access another user's information without being an admin. Not an average user action.
                });
                _context.SaveChanges();

                return Unauthorized(new ControlledException(
                    "You are not authorized to access this user's information. Your actions have been logged.",
                    ECode.UserController_GetUserById));
            }

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid user id", ECode.UserController_GetUserById));
            }

            var userSearchedFor = _context.Users
                .Where(u => u.Id == id)
                .Include(u => u.Role)
                .Include(u => u.Issues)
                .Include(u => u.AuditLogs)
                .FirstOrDefault();

            if (userSearchedFor == null)
            {
                return NotFound(new ControlledException("User with the given ID was not found",
                    ECode.UserController_GetUserById));
            }

            return Ok(Mapper.ToUserDto(userSearchedFor.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_GetUserById));
        }
    }

    /// <summary>
    /// Retrieves a list of all users from the system. Only users with administrative privileges
    /// have access to this endpoint.
    /// </summary>
    /// <remarks>
    /// Route: /api/User/all
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// Authorization: Requires a valid JWT token with administrative rights.
    /// </remarks>
    /// <returns>
    /// 200: Returns a collection of all users in the system.
    /// 401: Returns an error message if the requesting user is not authorized or lacks administrative rights.
    /// 400: Returns an error message in case of an internal error during execution.
    /// </returns>
    [HttpGet("all")]
    public IActionResult GetAllUsers()
    {
        try
        {
            var isAdmin = HelperClass.ParseUser(User, _context).Role.IsAdmin;

            if (!isAdmin)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = HelperClass.ParseUser(User, _context),
                    Action = "Unauthorized Access Attempt",
                    Details = "User attempted to access all users without administrative privileges.",
                    SuspiciousScore =
                        3 // This will only be triggered if someone tries to access all users without being an admin. Not an average user action. 3 Points because this endpoint is only used by admins.
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException(
                    "You are not authorized to access this endpoint. Your actions have been logged.",
                    ECode.UserController_GetAllUsers));
            }

            // Had to split the DTO mapping into two steps because otherwise it would cause a double DataReader error.
            var allUsers = _context.Users
                .Where(u => !u.IsDeleted)
                .ToList();

            var allUsersDto = allUsers.Select(user => Mapper.ToUserDto(user.Id, _context)).ToList();

            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = HelperClass.ParseUser(User, _context),
                Action = "Get All Users",
                Details = "Used admin privileges to retrieve all users."
            });
            _context.SaveChanges();

            return Ok(allUsersDto);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_GetAllUsers));
        }
    }

    /// <summary>
    /// Updates the details of an existing user.
    /// </summary>
    /// <remarks>
    /// Route: /api/user/{id}
    /// Method: PATCH
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The unique identifier of the user to be updated.</param>
    /// <param name="userDto">An object containing the updated user details.</param>
    /// <returns>
    /// 200: Returns the updated user data as a DTO upon successful update.
    /// 400: Returns an error message if the request fails validation or cannot be processed.
    /// 401: Returns an error if the user is not authenticated or the authenticated user does not have permission to update the specified user.
    /// </returns>
    [HttpPatch("{id:guid}")]
    public IActionResult UpdateUser(Guid id, [FromBody] UpdateUserDTO userDto)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (userMakingRequest.Id != id && !userMakingRequest.Role.IsAdmin)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Update Attempt",
                    Details =
                        $"User {userMakingRequest.Id} attempted to update user information for ID {id} without sufficient permissions.",
                    SuspiciousScore =
                        2 // This will only be triggered if someone tries to update another user's information without being an admin. Not an average user action.
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException("You are not authorized to update this user's information",
                    ECode.UserController_UpdateUser));
            }

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid ID", ECode.UserController_UpdateUser));
            }

            var userToUpdate = _context.Users.Find(id);
            if (userToUpdate == null)
            {
                return NotFound(new ControlledException("User with the given ID was not found",
                    ECode.UserController_UpdateUser));
            }

            if (!string.IsNullOrEmpty(userDto.Username))
            {
                if (HelperClass.IsValidUsername(userDto.Username, _context))
                {
                    userToUpdate.Username = userDto.Username;
                }
                else
                {
                    return BadRequest(new ControlledException(
                        "Invalid Username. Someone might be using it already, or it contains special characters",
                        ECode.UserController_UpdateUser));
                }
            }

            if (!string.IsNullOrEmpty(userDto.Email))
            {
                if (HelperClass.IsValidEmail(userDto.Email))
                {
                    userToUpdate.Email = userDto.Email;
                }
                else
                {
                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Update User Attempt with Invalid Email",
                        Details =
                            $"User {userToUpdate.Id} attempted to update their email to an invalid format ({userDto.Email})",
                        IsSystemAction = true,
                        SuspiciousScore =
                            2 // suspicious cause email checks are already done in the frontend. If someone tries to register with an invalid email, it is likely a bot or malicious user.
                    });
                    _context.SaveChanges();
                    return BadRequest(new ControlledException("Invalid Email", ECode.UserController_UpdateUser));
                }
            }

            userToUpdate.Firstname = userDto.Firstname ?? userToUpdate.Firstname;
            userToUpdate.Lastname = userDto.Lastname ?? userToUpdate.Lastname;

            if (!string.IsNullOrEmpty(userDto.Password))
            {
                var pwHash = HashGenerator.GenerateHash(userDto.Password, out var salt);
                userToUpdate.Password = pwHash;
                userToUpdate.Salt = salt;
            }

            _context.SaveChanges();
            return Ok(Mapper.ToUserDto(userToUpdate.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_UpdateUser));
        }
    }

    /// <summary>
    /// Suspends a user by their ID, marking them as suspended in the system.
    /// </summary>
    /// <remarks>
    /// Route: /api/user/{id}/suspend
    /// Method: POST
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The unique identifier of the user to be suspended.</param>
    /// <param name="suspend">A boolean indicating whether to suspend (true) or unsuspend (false) the user. Defaults to true.</param>
    /// <returns>
    /// 200: Returns the details of the suspended user.
    /// 400: Returns an error message if the ID is invalid or an exception occurs.
    /// 401: Returns an error if the user making the request is not authenticated.
    /// 404: Returns an error if the user to suspend is not found.
    /// </returns>
    [HttpPost("{id:guid}/suspend")]
    public IActionResult SuspendUser(Guid id, [FromBody] Boolean suspend)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (!userMakingRequest.Role.IsAdmin)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Suspend Attempt",
                    Details =
                        $"User {userMakingRequest.Id} attempted to un/suspend user with ID {id} without sufficient permissions.",
                    SuspiciousScore =
                        3 // This will only be triggered if someone tries to suspend another user without being an admin. Not an average user action. 3 Points because this endpoint is only used by admins.
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException(
                    "You are not authorized to suspend users. Your actions have been logged.",
                    ECode.UserController_SuspendUser));
            }

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid ID", ECode.UserController_SuspendUser));
            }

            var userToSuspend = _context.Users.Find(id);
            if (userToSuspend == null)
            {
                return NotFound(new ControlledException("User with the given ID was not found",
                    ECode.UserController_SuspendUser));
            }

            if (suspend)
            {
                userToSuspend.IsSuspended = true;
                userToSuspend.SuspendedAt = DateTime.UtcNow;
            }
            else
            {
                userToSuspend.IsSuspended = false;
                userToSuspend.SuspendedAt = DateTime.MinValue;
            }

            _context.SaveChanges();
            return Ok(Mapper.ToUserDto(userToSuspend.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_SuspendUser));
        }
    }

    /// <summary>
    /// Deletes a user by their ID, marking them as deleted in the system.
    /// </summary>
    /// <remarks>
    /// Route: /api/user/{id}
    /// Method: DELETE
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The unique identifier of the user to delete.</param>
    /// <returns>
    /// 204: Returns 204 No Content.
    /// 400: Returns an error message if the input is invalid or an exception occurs during deletion.
    /// 401: Returns an error message if the user does not have sufficient permissions to perform this action.
    /// 404: Returns an error message if the user with the given ID does not exist.
    /// </returns>
    [HttpDelete]
    [Route("{id:guid}")]
    public IActionResult DeleteUser(Guid id)
    {

        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (!userMakingRequest.Role.IsAdmin && userMakingRequest.Id != id)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Delete Attempt",
                    Details =
                        $"User {userMakingRequest.Id} attempted to delete user with ID {id} without sufficient permissions.",
                    SuspiciousScore =
                        2 // This will only be triggered if someone tries to delete another user without being an admin. Not an average user action.
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException("You are not authorized to delete users",
                    ECode.UserController_DeleteUser));
            }

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid ID", ECode.UserController_DeleteUser));
            }

            var userToDelete = _context.Users.Find(id);
            if (userToDelete == null)
            {
                return NotFound(new ControlledException("User with the given ID was not found",
                    ECode.UserController_DeleteUser));
            }

            userToDelete.IsDeleted = true;
            userToDelete.DeletedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_DeleteUser));
        }
    }
}