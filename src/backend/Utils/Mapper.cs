﻿using Microsoft.EntityFrameworkCore;

public static class Mapper
{
    public static UserToFrontendDTO ToUserDto(Guid userId, Context context)
    {
        var userToMap = context.Users
            .Include(u => u.AuditLogs)
            .Include(u => u.Issues)
            .Include(u => u.Role)
            .Include(u => u.Notifications)
            .FirstOrDefault(u => u.Id == userId);
        
        return new UserToFrontendDTO
        {
            Id = userToMap!.Id,
            Username = userToMap.Username,
            Firstname = userToMap.Firstname!,
            Lastname = userToMap.Lastname!,
            Email = userToMap.Email,
            RoleId = userToMap.Role.Id,
            AuditLogs = userToMap.AuditLogs?.Select(a => a.Id).ToList(),
            Issues = userToMap.Issues?.Select(i => i.Id).ToList(),
            Notifications = userToMap.Notifications?.Select(n => n.Id).ToList(),
            CreatedAt = userToMap.CreatedAt,
            IsDeleted = userToMap.IsDeleted,
            IsSuspended = userToMap.IsSuspended,
            DeletedAt = userToMap.DeletedAt,
            SuspendedAt = userToMap.SuspendedAt
        };
    }
    
    public static IssueToFrontendDTO ToIssueDto(Guid issueId, Context context)
    {
        
        var issue = context.Issues
            .Include(i => i.User)
            .Include(i => i.AssignedTo)
            .Include(i => i.Status)
            .Include(i => i.Priority)
            .Include(i => i.Comments)
            .Include(i => i.IssueTags)
            .Include(i => i.AuditLogs)
            .Include(i => i.Attachments)
            .Include(i => i.Notifications)
            .FirstOrDefault(i => i.Id == issueId);

        if (issue == null)
        {
            throw new ControlledException("Issue not found", ECode.IssueController_GetIssueById);
        }
        
        return new IssueToFrontendDTO
        {
            Id = issue.Id,
            Title = issue.Title,
            Description = issue.Description,
            CreatedAt = issue.CreatedAt,
            IsDeleted = issue.IsDeleted,
            DeletedAt = issue.DeletedAt,
            LastUpdated = issue.LastUpdated,
            UserId = issue.User.Id,
            AssignedToId = issue.AssignedToId,
            StatusId = issue.StatusId,
            PriorityId = issue.PriorityId,
            Comments = issue.Comments?.Select(c => c.Id).ToList(),
            IssueTags = issue.IssueTags?.Select(it => it.TagId).ToList(),
            AuditLogs = issue.AuditLogs?.Select(a => a.Id).ToList(),
            Attachments = issue.Attachments?.Select(a => a.Id).ToList(),
            Notifications = issue.Notifications?.Select(n => n.Id).ToList(),
        };
    }

    public static CommentToFrontendDTO ToCommentDto(Guid commentId, Context context)
    {
        var comment = context.Comments
            .Include(c => c.User)
            .Include(c => c.Issue)
            .Include(c => c.ParentComment)
            .Include(c => c.Replies)
            .Include(c => c.Attachments)
            .FirstOrDefault(c => c.Id == commentId);
        
        if (comment == null) 
        {
            throw new ControlledException("Comment not found", ECode.CommentController_GetCommentById);
        }
        
        return new CommentToFrontendDTO
        {
            Id = comment.Id,
            Content = comment.Content,
            CreatedAt = comment.CreatedAt,
            IsDeleted = comment.isDeleted,
            DeletedAt = comment.DeletedAt,
            UserId = comment.User.Id,
            IssueId = comment.Issue.Id,
            ParentCommentId = comment.ParentCommentId,
            Replies = comment.Replies.Select(r => r.Id).ToList() ?? [],
            Attachments = comment.Attachments?.Select(a => a.Id).ToList() ?? []
        };
    }
    
    public static NotificationToFrontendDTO ToNotificationDto(Guid notificationId, Context context)
    {
        var notification = context.Notifications
            .Include(n => n.User)
            .FirstOrDefault(n => n.Id == notificationId);
        
        if (notification == null) 
        {
            throw new ControlledException("Notification not found", ECode.NotificationController_GetNotificationById);
        }
        
        return new NotificationToFrontendDTO
        {
            Id = notification.Id,
            UserId = notification.User.Id,
            Message = notification.Message,
            CreatedAt = notification.CreatedAt,
            IsRead = notification.IsRead,
            IssueId = notification.IssueId,
            ReadAt = notification.ReadAt
        };
    }

    public static PriorityToFrontendDTO ToPriorityDto(Guid priorityId, Context context)
    {
        var priority = context.Priorities.FirstOrDefault(p => p.Id == priorityId);

        if (priority == null)
        {
            throw new ControlledException("Priority not found", ECode.PriorityController_GetPriorityById);
        }

        return new PriorityToFrontendDTO
        {
            Id = priority.Id,
            Name = priority.Name,
            Description = priority.Description,
            Color = priority.Color.ToLower()
        };
    }
}