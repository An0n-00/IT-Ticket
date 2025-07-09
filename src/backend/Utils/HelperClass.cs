using System.Security.Claims;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

/// <summary>
/// This class contains helper methods for validating email addresses and usernames and later on probably more.
/// </summary>
public class HelperClass
{
    public static bool IsValidEmail(string email)
    {
        return Regex.IsMatch(email, """(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])""");
    }

    public static bool IsValidUsername(string username, Context context)
    {
        // check if the username already exists in the database
        if (context.Users.Any(u => u.Username == username && !u.IsDeleted))
        {
            return false; 
        }
        return Regex.IsMatch(username, "^[a-zA-Z0-9_-]+$");
    }

    public static User ParseUser(ClaimsPrincipal user, Context context) 
    {
        var userIdMakingRequest = Guid.Parse(user.FindFirstValue(ClaimTypes.SerialNumber) ??
                                             throw new ControlledException(
                                                 "User ID wasn't found in claims. Something went wrong with the generation of the JWT token.",
                                                 ECode.UserController_GetUserById));
        
        var userInDb = context.Users
            .Include(u => u.Role)     
            .Include(u => u.AuditLogs)
            .Include(u => u.Issues)   
            .FirstOrDefault(u => u.Id == userIdMakingRequest);

        if (userInDb == null)
        {
            throw new ControlledException("User does not exist in the database.", ECode.UserController_GetUserById);
        }

        return userInDb;
    }
}