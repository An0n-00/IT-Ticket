using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// Handles issue-related operations within the application, including retrieval,
/// creation, updating, and deletion of issues. Authorization is required for all endpoints.
/// </summary>
/// <remarks>
/// All endpoints in this controller require a valid JSON Web Token (JWT) in the
/// Authorization header. Access control rules are applied as follows:
/// - Regular users can access their own issues only.
/// - Administrators and support personnel may access all issues.
/// </remarks>
/// <returns>
/// 401: If you call any endpoint in this controller without a valid JWT token in the Authorization header.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class IssueController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    /// <summary>
    /// Get their issues AS ID'S ONLY. Admins and support can see all issues, users can only see their own issues.
    /// </summary>
    /// <remarks>
    /// Route: /api/Issue
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: A list of IDs for their Issues.
    /// </returns>
    [HttpGet]
    public IActionResult GetIssues()
    {
        try
        {
            var user = HelperClass.ParseUser(User, _context);
            // Admins and support can see all issues
            if (user.Role.IsAdmin || user.Role.IsSupport)
            {
                var issues = _context.Issues.Select(i => i.Id).ToList();
                return Ok(issues);
            }

            var userIssues = _context.Issues.Where(i => i.UserId == user.Id && !i.IsDeleted).Select(i => i.Id).ToList();
            return Ok(userIssues);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.IssueController_GetAllIssues));
        }
    }


    /// <summary>
    /// Get their issue. Gets a single issue by its ID.
    /// </summary>
    /// <param name="id">The guid of the issue to get</param>
    /// <remarks>
    /// Route: /api/Issue
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: A list of IDs for their Issues.
    /// </returns>
    [HttpGet("{id:guid}")]
    public IActionResult GetIssue(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                throw new ControlledException("Invalid issue id", ECode.IssueController_GetIssueById);
            }

            var user = HelperClass.ParseUser(User, _context);
            if (user.Role.IsAdmin || user.Role.IsSupport)
            {
                try
                {
                    var issue = Mapper.ToIssueDto(id, _context);
                    return Ok(issue);
                }
                catch (Exception e)
                {
                    return BadRequest(new ControlledException(e.Message, ECode.IssueController_GetIssueById));
                }
            }

            var userIssue = _context.Issues.Include(issue => issue.User).FirstOrDefault(i => i.Id == id);
            if (userIssue!.User.Id != user.Id)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userIssue.User,
                    Action = "Unauthorized Access Attempt",
                    Issue = userIssue,
                    SuspiciousScore = 2, // trying to access another person's issue without enough permissions
                    Details = "User " + user.Id + " tried to access the endpoint for an issue which is not theirs."
                });
                _context.SaveChanges();
                return Unauthorized();
            }

            try
            {
                var issue = Mapper.ToIssueDto(id, _context);
                return Ok(issue);
            }
            catch (Exception e)
            {
                return BadRequest(new ControlledException(e.Message, ECode.IssueController_GetIssueById));
            }
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.IssueController_GetAllIssues));
        }
    }

    /// <summary>
    /// Get all issues. Admins and support can see all issues, users can only see their own issues. Users should not be using this endpoint.
    /// </summary>
    /// <remarks>
    /// Route: /api/Issue/all
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: A list of issues.
    /// </returns>
    [HttpGet("all")]
    public IActionResult GetAllIssues()
    {
        try
        {
            var user = HelperClass.ParseUser(User, _context);
            // Admins and support can see all issues
            if (user.Role is { IsAdmin: false, IsSupport: false })
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = user,
                    Action = "Unauthorized Access Attempt",
                    Details = "User attempted to access all issues without administrative/support privileges.",
                    SuspiciousScore =
                        3 // This will only be triggered if someone tries to access all issues without being an admin/support staff. Not an average user action. 3 Points because this endpoint is only used by admins/support staff.
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException(
                    "You are not authorized to access this endpoint. Your actions have been logged.",
                    ECode.UserController_GetAllUsers));
            }

            var userIssues = _context.Issues.Where(i => i.UserId == user.Id).ToList();

            // Map user issues to DTOs
            var userIssuesDto = new List<IssueToFrontendDTO>();
            foreach (var issue in userIssues)
            {
                userIssuesDto.Add(Mapper.ToIssueDto(issue.Id, _context));
            }

            return Ok(userIssuesDto);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.IssueController_GetAllIssues));
        }
    }

    /// <summary>
    /// Creates a new issue
    /// </summary>
    /// <remarks>
    /// Route: /api/issue/
    /// Method: POST
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="issueDto">An object containing the information for the issue.</param>
    /// <returns>
    /// 200: Returns the new issue upon successful creation.
    /// 400: Returns an error message if the request fails validation or cannot be processed.
    /// </returns>
    [HttpPost]
    public IActionResult CreateIssue([FromBody] IssueDTO issueDto)
    {
        try
        {
            var user = HelperClass.ParseUser(User, _context);

            // validate input from dto
            if (string.IsNullOrEmpty(issueDto.Title))
            {
                throw new ControlledException("Title is required", ECode.IssueController_CreateIssue);
            }

            if (string.IsNullOrEmpty(issueDto.Description))
            {
                throw new ControlledException("Description is required", ECode.IssueController_CreateIssue);
            }

            var newIssue = new Issue()
            {
                Title = issueDto.Title,
                Description = issueDto.Description,
                User = user
            };

            if (issueDto.AssignedToId != null)
            {
                var userTryingToBeAssignedToIssue = _context.Users.FirstOrDefault(u =>
                    u.Id == issueDto.AssignedToId && (!u.IsDeleted || !u.IsSuspended));
                if (userTryingToBeAssignedToIssue == null)
                {
                    throw new ControlledException("Could not assign the wished user to the issue",
                        ECode.IssueController_CreateIssue);
                }

                newIssue.AssignedTo = userTryingToBeAssignedToIssue;
            }

            if (issueDto.StatusId != null)
            {
                var status = _context.Status.FirstOrDefault(s => s.Id == issueDto.StatusId);
                if (status == null)
                {
                    throw new ControlledException("Could not find the wished status for the issue",
                        ECode.IssueController_CreateIssue);
                }

                newIssue.Status = status;
            }

            if (issueDto.PriorityId != null)
            {
                var priority = _context.Priorities.FirstOrDefault(p => p.Id == issueDto.PriorityId);
                if (priority == null)
                {
                    throw new ControlledException("Could not find the wished priority for the issue",
                        ECode.IssueController_CreateIssue);
                }

                newIssue.Priority = priority;
            }

            // everything seems valid. saving it:
            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                Action = "Created Issue",
                Details = "User " + user.Id + " created a new issue with this id: " + newIssue.Id,
                Issue = newIssue,
                User = user
            });
            _context.Issues.Add(newIssue);
            _context.SaveChanges();
            return Ok(new { id = newIssue.Id });
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.IssueController_UpdateIssue));
        }
    }

    /// <summary>
    /// Updates the details of an existing issue.
    /// </summary>
    /// <remarks>
    /// Route: /api/issue/{id}
    /// Method: PATCH
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The id of the issue to be updated.</param>
    /// <param name="issueDto">An object containing the updated issue details.</param>
    /// <returns>
    /// 200: Returns the updated issue data as a DTO upon successful update.
    /// 400: Returns an error message if the request fails validation or cannot be processed.
    /// 401: Returns an error if the user is not authenticated or the authenticated user does not have permission to update the specified issue.
    /// </returns>
    [HttpPatch("{id:guid}")]
    public IActionResult UpdateIssue(Guid id, [FromBody] IssueDTO issueDto)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid issue ID", ECode.UserController_UpdateUser));
            }

            if (_context.Issues.Any(i => i.Id == id && i.User.Id == userMakingRequest.Id) ||
                userMakingRequest.Role.IsAdmin || userMakingRequest.Role.IsSupport)
            {
                var issueToUpdate = _context.Issues.Find(id);
                if (issueToUpdate == null)
                {
                    return NotFound(new ControlledException("Issue with id: " + id + " not found",
                        ECode.IssueController_UpdateIssue));
                }

                // validate input from dto
                if (!string.IsNullOrEmpty(issueDto.Title))
                {
                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Updated Issue Title",
                        Details = "User " + userMakingRequest.Id + " updated the issue with this id: " +
                                  issueToUpdate.Id + "to a new title from: " + issueToUpdate.Title + " to " +
                                  issueDto.Title,
                        Issue = issueToUpdate,
                        User = userMakingRequest
                    });
                    issueToUpdate.Title = issueDto.Title ?? issueToUpdate.Title;
                }

                if (!string.IsNullOrEmpty(issueDto.Description))
                {
                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Updated Issue Description",
                        Details = "User " + userMakingRequest.Id + " updated the issue with this id: " +
                                  issueToUpdate.Id + "to a new description from: " + issueDto.Description,
                        Issue = issueToUpdate,
                        User = userMakingRequest
                    });
                    issueToUpdate.Description = issueDto.Description ?? issueToUpdate.Description;
                }

                if (issueDto.AssignedToId != null)
                {
                    var userTryingToBeAssignedToIssue = _context.Users.FirstOrDefault(u =>
                        u.Id == issueDto.AssignedToId && (!u.IsDeleted || !u.IsSuspended));
                    if (userTryingToBeAssignedToIssue == null)
                    {
                        throw new ControlledException("Could not assign the wished user to the issue",
                            ECode.IssueController_UpdateIssue);
                    }

                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Updated Issue Assignee",
                        Details = "User " + userMakingRequest.Id + " updated the issue with this id: " +
                                  issueToUpdate.Id + "to a new assignee from: " + issueToUpdate.AssignedToId + " to " +
                                  issueDto.AssignedToId,
                        Issue = issueToUpdate,
                        User = userMakingRequest
                    });

                    issueToUpdate.AssignedTo = userTryingToBeAssignedToIssue;
                }

                if (issueDto.StatusId != null)
                {
                    var status = _context.Status.FirstOrDefault(s => s.Id == issueDto.StatusId);
                    if (status == null)
                    {
                        throw new ControlledException("Could not find the wished status for the issue",
                            ECode.IssueController_UpdateIssue);
                    }

                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Updated Issue Status",
                        Details = "User " + userMakingRequest.Id + " updated the issue with this id: " +
                                  issueToUpdate.Id + "to a new status from: " + issueToUpdate.StatusId + " to " + issueDto.StatusId,
                        Issue = issueToUpdate,
                        User = userMakingRequest
                    });

                    issueToUpdate.Status = status;
                }

                if (issueDto.PriorityId != null)
                {
                    var priority = _context.Priorities.FirstOrDefault(p => p.Id == issueDto.PriorityId);
                    if (priority == null)
                    {
                        throw new ControlledException("Could not find the wished priority for the issue",
                            ECode.IssueController_UpdateIssue);
                    }

                    _context.AuditLogs.Add(new AuditLog(HttpContext)
                    {
                        Action = "Updated Issue Priority",
                        Details = "User " + userMakingRequest.Id + " updated the issue with this id: " +
                                  issueToUpdate.Id + "to a new priority from: " +  issueToUpdate.PriorityId +  " to " + issueDto.PriorityId, 
                        Issue = issueToUpdate,
                        User = userMakingRequest
                    });

                    issueToUpdate.Priority = priority;
                }
                
                issueToUpdate.LastUpdated = DateTime.Now;

                _context.Issues.Update(issueToUpdate);

                // everything seems valid. saving it:
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    Action = "Updated Issue",
                    Details = "User " + userMakingRequest.Id + " updated the issue with this id: " + issueToUpdate.Id,
                    Issue = issueToUpdate,
                    User = userMakingRequest
                });
                _context.SaveChanges();
                return Ok(Mapper.ToIssueDto(id, _context));
            }

            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = userMakingRequest,
                Action = "Unauthorized Update Attempt",
                Details =
                    $"User {userMakingRequest.Id} attempted to update an issue ({id}) which is not theirs/does not have enough rights for.",
                SuspiciousScore =
                    2 // This will only be triggered if someone tries to update another user's issue without being an admin/support. Not an average user action.
            });
            _context.SaveChanges();
            return Unauthorized(new ControlledException("You are not authorized to update this issue",
                ECode.UserController_UpdateUser));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.IssueController_UpdateIssue));
        }
    }

    /// <summary>
    /// Deletes an issue.
    /// </summary>
    /// <remarks>
    /// Route: /api/issue/{id}
    /// Method: DELETE
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The id of the issue to delete.</param>
    /// <returns>
    /// 204: Returns 204 No Content.
    /// 400: Returns an error message if the input is invalid or an exception occurs during deletion.
    /// 401: Returns an error message if the user does not have sufficient permissions to perform this action.
    /// 404: Returns an error message if the issue with the given ID does not exist.
    /// </returns>
    [HttpDelete]
    [Route("{id:guid}")]
    public IActionResult DeleteIssue(Guid id)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);
            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid issue ID", ECode.UserController_UpdateUser));
            }

            if (_context.Issues.Any(i => i.Id == id && i.User.Id == userMakingRequest.Id && !i.IsDeleted) ||
                userMakingRequest.Role.IsAdmin || userMakingRequest.Role.IsSupport)
            {
                var issueToDelete = _context.Issues.Find(id);
                if (issueToDelete == null || issueToDelete.IsDeleted)
                {
                    return NotFound(new ControlledException("Issue with id: " + id + " not found",
                        ECode.IssueController_UpdateIssue));
                }
                
                issueToDelete.IsDeleted = true;
                issueToDelete.DeletedAt = DateTime.UtcNow;
                
                _context.Issues.Update(issueToDelete);
                
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    Action = "Deleted Issue",
                    Details = "User " + userMakingRequest.Id + " deleted the issue with this id: " + issueToDelete.Id,
                    Issue = issueToDelete,
                    User = userMakingRequest
                });
                _context.SaveChanges();
                return NoContent();
            }

            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = userMakingRequest,
                Action = "Unauthorized Deletion Attempt",
                Details =
                    $"User {userMakingRequest.Id} attempted to delete an issue ({id})  which is not theirs/does not have enough rights for.",
                SuspiciousScore =
                    2 // This will only be triggered if someone tries to delete another user's issue without being an admin/support. Not an average user action.
            });
            _context.SaveChanges();
            return Unauthorized(new ControlledException("You are not authorized to delete this issue. Your actions have been logged.",
                ECode.UserController_UpdateUser));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_DeleteUser));
        }
    }
}