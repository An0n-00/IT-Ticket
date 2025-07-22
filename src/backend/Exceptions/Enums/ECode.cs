using System.ComponentModel;
using Humanizer;

/// <summary>
/// Enum representing various error codes for controlled exceptions.
/// </summary>
public enum ECode
{
    [Description("Get all issues")]
    IssueController_GetAllIssues = 1000,

    [Description("Get issue by ID")]
    IssueController_GetIssueById = 1001,

    [Description("Create a new issue")]
    IssueController_CreateIssue = 1002,

    [Description("Update an existing issue")]
    IssueController_UpdateIssue = 1003,

    [Description("Delete an issue")]
    IssueController_DeleteIssue = 1004,

    [Description("Get all users")]
    UserController_GetAllUsers = 2000,

    [Description("Get user by ID")]
    UserController_GetUserById = 2001,

    [Description("Update an existing user")]
    UserController_UpdateUser = 2003,

    [Description("Delete a user")]
    UserController_DeleteUser = 2004,

    [Description("Suspend a user")]
    UserController_SuspendUser,

    [Description("User login")]
    UserController_Login = 2005,

    [Description("User registration")]
    UserController_Register = 2006,

    [Description("User logout")]
    UserController_Logout = 2007,

    [Description("Refresh authentication token")]
    UserController_RefreshToken = 2008,

    [Description("Change user password")]
    UserController_ChangePassword = 2009,

    [Description("Forgot password process")]
    UserController_ForgotPassword = 2010,

    [Description("Reset password process")]
    UserController_ResetPassword = 2011,

    [Description("Get single user")]
    UserController_GetCurrentUser = 2012,

    [Description("Role is null")]
    AuthController_CreateToken = 2012,

    [Description("Elevate user role")]
    UserController_ElevateUser = 2013,

    [Description("Faulty appsettings configuration")]
    Appsettings_Faulty = 3000,

    [Description("Database connection error")]
    Database_ConnectionError = 4001,

    [Description("Database initialization error")]
    Database_InitializationError = 4002,

    [Description("Unknown Database error")]
    Database_UnknownError = 4003,

    [Description("Get comment by ID")]
    CommentController_GetCommentById = 5000,

    [Description("Create a new comment")]
    CommentController_CreateComment = 5001,

    [Description("Update an existing comment")]
    CommentController_UpdateComment = 5002,

    [Description("Delete a comment")]
    CommentController_DeleteComment = 5003,

    [Description("Get notification by ID")]
    NotificationController_GetNotificationById = 6000,

    [Description("Get a users notifications")]
    NotificationController_GetNotification = 6001,

    [Description("Read a notification")]
    NotificationController_ReadNotification = 6002,

    [Description("Get all priorities")]
    PriorityController_GetAllPriorities = 7000,

    [Description("Get all priorities")]
    PriorityController_GetPriorityById = 7001,

    [Description("Get all roles")]
    RoleController_GetAllRoles = 8000,

    [Description("Get a role by ID")]
    RoleController_GetRole = 8001,

    [Description("Get all statuses")]
    StatusController_GetAllStatuses = 9000,

    [Description("Get a status by ID")]
    StatusController_GetStatusById = 9001,

    [Description("Get all tags")]
    TagController_GetAllTags = 10000,

    [Description("Get a tag by ID")]
    TagController_GetTagById = 10001,

}
