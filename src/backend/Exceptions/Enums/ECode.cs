using System.ComponentModel;

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
    
    [Description("Create a new user")]
    UserController_CreateUser = 2002,
    
    [Description("Update an existing user")]
    UserController_UpdateUser = 2003,
    
    [Description("Delete a user")]
    UserController_DeleteUser = 2004,
    
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
    
    [Description("Faulty appsettings configuration")]
    Appsettings_Faulty = 3000,
    
    [Description("Database connection error")]
    Database_ConnectionError = 4001,
    
    [Description("Database initialization error")]
    Database_InitializationError = 4002,
    
    [Description("Unknown Database error")]
    Database_UnknownError = 4003
    
}
