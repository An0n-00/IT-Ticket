using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// CommentController handles API operations related to comments such as creating, retrieving, updating, and deleting comments.
/// </summary>
/// <param name="context">The database context used for accessing comment data.</param>
/// <remarks>
/// This controller provides endpoints for managing comment-related data.
/// Functionalities include creating, retrieving, updating, and deleting comments.
/// </remarks>
/// <returns>
/// 401: When requested without a valid Bearer token.
/// </returns>
[Route("/api/[controller]")]
[Produces("application/json")]
[ApiController]
[Authorize]
public class CommentController(Context context) : ControllerBase
{
    private readonly Context _context = context;

    
    /// <summary>
    /// Gets a comment by its ID.
    /// </summary>
    /// <param name="id">The guid of the comment to retrieve.</param>
    /// <remarks>
    /// Route: /api/Comment/{id}
    /// Method: GET
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns the comment with the specified ID.
    /// 400: If the ID is invalid or if an error occurs while retrieving the comment.
    /// </returns>
    [HttpGet("{id:guid}")]
    public IActionResult GetComment(Guid id)
    {
        try
        {
            if (id == Guid.Empty)
            {
                throw new ControlledException("Invalid comment id", ECode.CommentController_GetCommentById);
            }

            if (_context.Comments.Find(id) == null)
            {
                return NotFound(new ControlledException("Comment not found", ECode.CommentController_GetCommentById));
            }

            var comment = Mapper.ToCommentDto(id, _context);
            return Ok(comment);
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.CommentController_GetCommentById));
        }
    }
    
    /// <summary>
    /// Create a new comment. This can be reply to an existing comment or a new comment on an issue.
    /// </summary>
    /// <remarks>
    /// Route: /api/Comment/{id}
    /// Method: POST
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <returns>
    /// 200: Returns the created comment data as a DTO.
    /// 400: If any error occurs while creating the comment, such as invalid data or database issues.
    /// </returns>
    [HttpPost]
    public IActionResult CreateComment(Guid id, [FromBody] CommentDTO commentDto)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (commentDto == null)
            {
                throw new ControlledException("Comment data is required", ECode.CommentController_CreateComment);
            }
            
            if (commentDto.IssueId == Guid.Empty || !_context.Issues.Any(i => i.Id == commentDto.IssueId))
            {
                throw new ControlledException("Invalid or non-existent issue ID", ECode.CommentController_CreateComment);
            }

            if (string.IsNullOrWhiteSpace(commentDto.Content))
            {
                throw new ControlledException("Comment content cannot be empty", ECode.CommentController_CreateComment);
            }

            var comment = new Comment
            {
                IssueId = commentDto.IssueId,
                Content = commentDto.Content,
                User = userMakingRequest,
            };
            
            if (commentDto.ParentCommentId != null)
            {
                var parentComment = _context.Comments.Find(commentDto.ParentCommentId);
                if (parentComment == null)
                {
                    return NotFound(new ControlledException("Parent comment not found", ECode.CommentController_CreateComment));
                }
                comment.ParentComment = parentComment;
            }
            
            _context.Comments.Add(comment);
            _context.SaveChanges();

            return Ok(Mapper.ToCommentDto(comment.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.CommentController_CreateComment));
        }
    }
    
    /// <summary>
    /// Updates the details of an existing comment.
    /// </summary>
    /// <remarks>
    /// Route: /api/comment/{id}
    /// Method: PATCH
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The unique identifier of the comment to be updated.</param>
    /// <param name="commentDto">An object containing the updated comment details.</param>
    /// <returns>
    /// 200: Returns the updated comment data as a DTO upon successful update.
    /// 400: Returns an error message if the request fails validation or cannot be processed.
    /// 401: Returns an error if the user is not authenticated or does not have permission to update the specified comment.
    /// 404: Returns an error if the comment is not found.
    /// </returns>
    [HttpPatch("{id:guid}")]
    public IActionResult UpdateComment(Guid id, [FromBody] CommentDTO commentDto)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid comment ID", ECode.CommentController_UpdateComment));
            }

            var commentToUpdate = _context.Comments.Include(c => c.User).FirstOrDefault(c => c.Id == id);
            if (commentToUpdate == null)
            {
                return NotFound(new ControlledException("Comment not found", ECode.CommentController_UpdateComment));
            }

            // Only the comment owner or admin/support can update
            if (commentToUpdate.User.Id != userMakingRequest.Id &&
                !(userMakingRequest.Role.IsAdmin || userMakingRequest.Role.IsSupport))
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Update Attempt",
                    Details = $"User {userMakingRequest.Id} attempted to update comment {id} without permission.",
                    SuspiciousScore = 2
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException("You are not authorized to update this comment", ECode.CommentController_UpdateComment));
            }

            if (!string.IsNullOrWhiteSpace(commentDto.Content))
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    IssueId = commentToUpdate.IssueId,
                    Action = "Updated Comment Content",
                    Details = $"User {userMakingRequest.Id} updated comment {id} content.",
                });
                commentToUpdate.Content = commentDto.Content;
            }

            _context.Comments.Update(commentToUpdate);
            _context.SaveChanges();

            return Ok(Mapper.ToCommentDto(commentToUpdate.Id, _context));
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.CommentController_UpdateComment));
        }
    }

    /// <summary>
    /// Deletes a comment by its ID, marking it as deleted in the system.
    /// </summary>
    /// <remarks>
    /// Route: /api/comment/{id}
    /// Method: DELETE
    /// Consumes: application/json
    /// Produces: application/json
    /// </remarks>
    /// <param name="id">The unique identifier of the comment to delete.</param>
    /// <returns>
    /// 204: Returns 204 No Content.
    /// 400: Returns an error message if the input is invalid or an exception occurs during deletion.
    /// 401: Returns an error message if the user does not have sufficient permissions to perform this action.
    /// 404: Returns an error message if the comment with the given ID does not exist.
    /// </returns>
    [HttpDelete("{id:guid}")]
    public IActionResult DeleteComment(Guid id)
    {
        try
        {
            var userMakingRequest = HelperClass.ParseUser(User, _context);

            if (id == Guid.Empty)
            {
                return BadRequest(new ControlledException("Invalid comment ID", ECode.CommentController_DeleteComment));
            }

            var commentToDelete = _context.Comments.Include(c => c.User).FirstOrDefault(c => c.Id == id);
            if (commentToDelete == null)
            {
                return NotFound(new ControlledException("Comment not found", ECode.CommentController_DeleteComment));
            }

            // Only the comment owner or admin/support can delete
            if (commentToDelete.User.Id != userMakingRequest.Id &&
                !(userMakingRequest.Role.IsAdmin || userMakingRequest.Role.IsSupport))
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userMakingRequest,
                    Action = "Unauthorized Delete Attempt",
                    Details = $"User {userMakingRequest.Id} attempted to delete comment {id} without permission.",
                    SuspiciousScore = 2
                });
                _context.SaveChanges();
                return Unauthorized(new ControlledException("You are not authorized to delete this comment", ECode.CommentController_DeleteComment));
            }

            commentToDelete.isDeleted = true;
            commentToDelete.DeletedAt = DateTime.UtcNow;

            _context.Comments.Update(commentToDelete);

            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = userMakingRequest,
                IssueId = commentToDelete.IssueId,
                Action = "Deleted Comment",
                Details = $"User {userMakingRequest.Id} deleted comment {id}.",
            });
            _context.SaveChanges();

            return NoContent();
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.CommentController_DeleteComment));
        }
    }
}