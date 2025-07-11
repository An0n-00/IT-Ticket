using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NuGet.Protocol;

/// <summary>
/// The `AuthController` handles authentication-related operations such as login and user registration.
/// </summary>
/// <remarks>
/// All routes in this controller are prefixed with `/auth/api`.
/// This controller processes requests and returns responses in JSON format.
/// </remarks>
/// <param name="context">Context for database operations.</param>
[Route("/auth/api")]
[Produces("application/json")]
[ApiController]
public class AuthController(Context context) : ControllerBase
{
    private readonly Context _context = context;

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
    /// 400: Returns an error message if the login fails, such as an incorrect username or password.
    /// </returns>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginDTO loginDto)
    {
        User? userInDb = _context.Users.Include(user => user.Role).FirstOrDefault(u => u.Username == loginDto.Username && !u.IsDeleted);
        
        if (userInDb == null)
        {
            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                Action = "Login Attempt",
                Details = $"User with username {loginDto.Username} attempted to log in but does not exist.",
                IsSystemAction = true
            });
            _context.SaveChanges();
            return BadRequest(new ControlledException("Username and/or Password is wrong", ECode.UserController_Login));
        }
        
        if (userInDb.IsSuspended)
        {
            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = userInDb,
                Action = "Login Attempt",
                Details = $"User {userInDb.Id} attempted to log in but is suspended.",
                SuspiciousScore = 0
            });
            _context.SaveChanges();
            return StatusCode(403, new ControlledException("Your account is suspended. Please contact support.", ECode.UserController_Login));
        }
        
        _context.AuditLogs.Add(new AuditLog(HttpContext)
        {
            User = userInDb,
            Action = "Login Attempt",
            Details = $"User {userInDb.Id} attempted to log in with username: {loginDto.Username}.",
        });
        _context.SaveChanges();

        if (HashGenerator.VerifyHash(userInDb.Password, loginDto.Password, userInDb.Salt))
        {
            try
            {
                var token = CreateToken(userInDb.Id, userInDb.Username, userInDb.Role);
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userInDb,
                    Action = "Login Success",
                    Details = $"User {userInDb.Id} logged in successfully."
                });
                _context.SaveChanges();
                return Ok(token);
            }
            catch (Exception e)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = userInDb,
                    Action = "Login Failed",
                    Details = $"User {userInDb.Id} failed to login: {e.Message}",
                });
                _context.SaveChanges();
                return BadRequest(new ControlledException(e.Message, ECode.UserController_Login));
            }
        }

        _context.AuditLogs.Add(new AuditLog(HttpContext)
        {
            User = userInDb,
            Action = "Login Failed",
            Details = $"User {userInDb.Id} failed to log in with the tried credentials.",
            SuspiciousScore = 1
        });
        _context.SaveChanges();

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
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    Action = "Registration Attempt",
                    Details = $"User with email {registerDto.Email} attempted to register but provided an invalid email.",
                    IsSystemAction = true,
                    SuspiciousScore = 2 // suspicious cause email checks are already done in the frontend. If someone tries to register with an invalid email, it is likely a bot or malicious user.
                });
                _context.SaveChanges();
                return BadRequest(new ControlledException("Please enter a valid email address", ECode.UserController_Register));
            }

            // check against special characters in the username
            if (!HelperClass.IsValidUsername(registerDto.Username, _context))
            {
                return BadRequest(new ControlledException("Invalid Username. Someone might be using it already, or it contains special characters", ECode.UserController_Register));
            }
            
            var newUser = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Firstname = registerDto.FirstName,
                Lastname = registerDto.LastName,
                RoleId = _context.Roles.FirstOrDefault(r => r.IsDefault == true)?.Id ?? throw new ControlledException("Default user role not found", ECode.UserController_Register),
                Issues = new List<Issue>(),
            };

            var pwHash = HashGenerator.GenerateHash(registerDto.Password, out var salt);
            newUser.Password = pwHash;
            newUser.Salt = salt;
            _context.Users.Add(newUser);
            _context.SaveChanges();
            _context.AuditLogs.Add(new AuditLog(HttpContext)
            {
                User = newUser,
                Action = "User Registration",
                Details = $"User {newUser.Id} registered successfully."
            });
            _context.Notifications.Add(new Notification
            {
                User = newUser,
                Message = "Welcome to IT-Ticket! Your account has been created successfully. Feel free to read the documentation to get started.",
            });
            _context.SaveChanges();
            try
            {
                var token = CreateToken(newUser.Id, newUser.Username, newUser.Role);
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = newUser,
                    Action = "Token Creation",
                    Details = $"User {newUser.Id} created a token successfully."
                });
                _context.SaveChanges();
                return Ok(token);
            }
            catch (Exception e)
            {
                _context.AuditLogs.Add(new AuditLog(HttpContext)
                {
                    User = newUser,
                    Action = "Token Creation Failed",
                    Details = $"User {newUser.Id} failed to create a token."
                });
                _context.SaveChanges();
                return BadRequest(new ControlledException(e.Message, ECode.UserController_Register));
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
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
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