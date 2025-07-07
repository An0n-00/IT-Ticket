using System.Security.Claims;

public static class ControllerHelper
{
    public static User ParseUser(ClaimsPrincipal user, Context context) 
    {
        var userIdMakingRequest = Guid.Parse(user.FindFirstValue(ClaimTypes.SerialNumber) ??
                                             throw new ControlledException(
                                                 "User ID wasn't found in claims. Something went wrong with the generation of the JWT token.",
                                                 ECode.UserController_GetUserById));

        var userInDb = context.Users.Find(userIdMakingRequest);
        if (userInDb == null)
        {
            throw new ControlledException("User does not exist in the database.", ECode.UserController_GetUserById);
        }
        return userInDb;
    }
}