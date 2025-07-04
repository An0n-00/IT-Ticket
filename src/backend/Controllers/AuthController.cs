using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol;

[Route("/auth/api")]
[Produces("application/json")]
[ApiController]
public class AuthController(Context context) : ControllerBase
{
    /// <summary>
    /// This endpoint is used to login a user.
    /// </summary>
    /// <remarks>
    /// Route: /auth/api/login  
    /// Method: POST  
    /// Consumes: application/json  
    /// Produces: application/json  
    /// </remarks>
    /// <param name="loginDto">The login data transfer object containing the username and password.</param>
    /// <returns>
    /// 200: Returns a JWT token with user details if login is successful.
    /// 400: Returns an error message if the login fails, such as incorrect username or password.
    /// </returns>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDTO loginDto)
    {
        User? userInDb = context.User.Include(user => user.Role).FirstOrDefault(u => u.Username == loginDto.Username);
        
        if (userInDb == null)
        {
            context.AuditLog.Add(new AuditLog
            {
                UserId = null,
                Action = "Login Attempt",
                Details = $"User with username {loginDto.Username} attempted to log in but does not exist."
            });
            context.SaveChanges();
            return BadRequest(new ControlledException("Username and/or Password is wrong", ECode.UserController_Login));
        }
        
        context.AuditLog.Add(new AuditLog
        {
            UserId = userInDb?.Id,
            Action = "Login Attempt",
            Details = $"User {userInDb!.Username} attempted to log in with username: {loginDto.Username}."
        });
        context.SaveChanges();

        if (HashGenerator.VerifyHash(userInDb.Password, loginDto.Password, userInDb.Salt))
        {
            try
            {
                var token = CreateToken(userInDb.Id, userInDb.Username, userInDb.Role);
                context.AuditLog.Add(new AuditLog
                {
                    UserId = userInDb.Id,
                    Action = "Login Success",
                    Details = $"User {userInDb.Username} logged in successfully."
                });
                context.SaveChanges();
                return Ok(token);
            }
            catch (Exception e)
            {
                context.AuditLog.Add(new AuditLog
                {
                    UserId = userInDb.Id,
                    Action = "Login Failed",
                    Details = $"User {userInDb.Username} failed to login: {e.Message}"
                });
                context.SaveChanges();
                return BadRequest(e.ToJson());
            }
        }

        context.AuditLog.Add(new AuditLog
        {
            UserId = userInDb.Id,
            Action = "Login Failed",
            Details = $"User {userInDb.Username} failed to log in with the tried credentials."
        });
        context.SaveChanges();

        return BadRequest(new ControlledException("Username and/or Password is wrong", ECode.UserController_Login));
    }

    /// <summary>
    /// This endpoint is used to register a new user.
    /// </summary>
    /// <param name="registerDto">The registration data transfer object containing the username, password, and email.</param>
    /// <remarks>
    /// Route: /auth/api/register  
    /// Method: POST  
    /// Consumes: application/json  
    /// Produces: application/json  
    /// </remarks>
    /// <returns>
    /// 200: Returns a JWT token with user details if registration is successful.
    /// 400: Returns an error message if the registration fails, such as email already in use or invalid input.
    /// </returns>
    [HttpPost("register")]
    public IActionResult Post([FromBody] RegisterDTO registerDto)
    {
        try
        {
            if (string.IsNullOrEmpty(registerDto.Username) || string.IsNullOrEmpty(registerDto.Password) ||
                string.IsNullOrEmpty(registerDto.Email))
            {
                return BadRequest(new ControlledException("Please fill in all fields", ECode.UserController_Register));
            }

            // check if the email is valid
            if (!HelperClass.IsValidEmail(registerDto.Email))
            {
                return BadRequest(new ControlledException("Please enter a valid email address", ECode.UserController_Register));
            }

            // check against special characters in the username
            if (!HelperClass.IsValidUsername(registerDto.Username))
            {
                return BadRequest(new ControlledException("Do not use special characters in your username", ECode.UserController_Register));
            }
            
            // check if the username already exists
            if (context.User.Any(u => u.Username == registerDto.Username))
            {
                return BadRequest(new ControlledException("Username already exists", ECode.UserController_Register));
            }
            
            var newUser = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Firstname = registerDto.FirstName,
                Lastname = registerDto.LastName,
                RoleId = context.Role.FirstOrDefault(r => r.IsDefault == true)?.Id ?? throw new ControlledException("Default user role not found", ECode.UserController_Register),
                Issues = new List<Issue>(),
            };

            var pwHash = HashGenerator.GenerateHash(registerDto.Password, out var salt);
            newUser.Password = pwHash;
            newUser.Salt = salt;
            context.User.Add(newUser);
            context.SaveChanges();
            context.AuditLog.Add(new AuditLog
            {
                UserId = newUser.Id,
                Action = "User Registration",
                Details = $"User {newUser.Username} registered successfully."
            });
            context.Notification.Add(new Notification
            {
                UserId = newUser.Id,
                Message = "Welcome to IT-Ticket! Your account has been created successfully."
            });
            context.SaveChanges();
            try
            {
                var token = CreateToken(newUser.Id, newUser.Username, newUser.Role);
                context.AuditLog.Add(new AuditLog
                {
                    UserId = newUser.Id,
                    Action = "Token Creation",
                    Details = $"User {newUser.Username} created a token successfully."
                });
                context.SaveChanges();
                return Ok(token);
            }
            catch (Exception e)
            {
                context.AuditLog.Add(new AuditLog
                {
                    UserId = newUser.Id,
                    Action = "Token Creation Failed",
                    Details = $"User {newUser.Username} failed to create a token."
                });
                context.SaveChanges();
                return BadRequest(e.ToJson());
            }
        }
        catch (Exception e)
        {
            return BadRequest(new ControlledException(e.Message, ECode.UserController_Register));
        }
    }

    /// <summary>
    /// Creates the JWT token **object** for the user.
    /// </summary>
    private object CreateToken(Guid userId, string username, Role role)
    {
        try
        {
            var expires = DateTime.UtcNow.AddDays(5);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity([
                    new Claim(ClaimTypes.SerialNumber, Convert.ToString(userId) ?? throw new ControlledException("UserId is null when creating the token", ECode.AuthController_CreateToken)),
                    new Claim(ClaimTypes.Name, username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, role.ToString() ?? throw new ControlledException("Role is null", ECode.AuthController_CreateToken))
                ]),
                Expires = expires,
                Issuer = JwtHelper.ValidIssuer,
                Audience = JwtHelper.ValidAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtHelper.IssuerSigningKey)),
                    SecurityAlgorithms.HmacSha512Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return new
            {
                Username = username, Role = role.ToString(), ExpiresAt = expires, JWT = jwtToken, UserId = userId
            };
        }
        catch (ArgumentOutOfRangeException ex) when (ex.Message.Contains("IDX10720"))
        {
            throw new ControlledException(
                "JWT signing key is too short. Please use a key of at least 64 characters (512 bits) for HMAC-SHA512.",
                ECode.AuthController_CreateToken);
        }
        catch (Exception ex)
        {
            throw new ControlledException($"An error occurred while creating the token: {ex.Message}", ECode.AuthController_CreateToken);
        }
    }
}