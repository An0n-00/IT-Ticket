using M295.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace M295.Controllers
{
    
    [Route("/auth/api/[controller]")]
    [Produces("application/json")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly Context _context;

        public UserController(Context context)
        {
            _context = context;
        }


        // GET: auth/api/user 
        // Returns all users - admins only
        [HttpGet]
        [Authorize]
        public IActionResult Get()
        {
            try
            {
                string? role = User.FindFirstValue(ClaimTypes.Role);
                if (role == "admin")
                {
                    return Ok(_context.User);
                }

                return Unauthorized();
            }
            catch (Exception e)
            {
                return BadRequest(new Error { Message = e.Message, ECode = "0xUserCGet" });
            }
        }


        // GET: auth/api/user/id
        // Returns the user with the given id - Only for users or admins
        [HttpGet("{id}")]
        [Authorize]
        public IActionResult Get(Guid id)
        {
            try
            {
                Guid requestingId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber));
                
                var user = _context.User.Find(id);
                if (user == null)
                {
                    return NotFound(new Error { Message = "User not found", ECode = "0xUserCGetID" });
                }

                if (requestingId == user.Id)
                {
                    return Ok(new {user.Id, user.Email, user.Username, user.Firstname, user.Lastname, user.Role});
                }
                
                return Ok(new {user.Id, user.Username, user.Firstname, user.Lastname, user.Role});
            }
            catch
            {
                return BadRequest(new Error { Message = "Cannot find user", ECode = "0xUserCGetID" });
            }
        }


        // POST: auth/api/user/login
        // Logs in the user with the given credentials - Only for users or admins
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            User? userInDb = _context.User.FirstOrDefault(user => user.Username == loginRequest.Username);
            if (userInDb != null && HashGenerator.VerifyHash(userInDb.Password, loginRequest.Password, userInDb.Salt))
            {
                return Ok(CreateToken(userInDb.Id, userInDb.Username, userInDb.Role));
            }
            return BadRequest(new Error { Message = "Username and/or Password is wrong", ECode = "0xUserCLogin" });
        }


        // POST: auth/api/register
        // Creates a new user - Only for users or admins
        [HttpPost("register")]
        public IActionResult Post([FromBody] User newUserFromPost)
        {
            try
            {
                string salt;
                string pwHash = HashGenerator.GenerateHash(newUserFromPost.Password, out salt);
                
                User newUser = new User() {
                    Email = newUserFromPost.Email.ToLower(), 
                    Firstname = newUserFromPost.Firstname,
                    Lastname = newUserFromPost.Lastname,
                    Username = newUserFromPost.Username.Replace(' ', '-'),
                    Password = pwHash, 
                    Salt = salt 
                };
                
                bool isUserInDatabase = _context.User.FirstOrDefault(user => user.Email == newUserFromPost.Email) != null || _context.User.FirstOrDefault(user => user.Username == newUserFromPost.Username) != null || newUser.Username.ToLower().StartsWith("admin");
                if (!isUserInDatabase)
                {
                    _context.User.Add(newUser);
                    _context.SaveChanges();
                    return Ok(CreateToken(newUser.Id, newUser.Username, newUser.Role));
                }
                else if (_context.User.FirstOrDefault(user => user.Email == newUser.Email) != null)
                {
                    return BadRequest(new Error { Message = "Email already in use", ECode = "0xUserCRegister" });
                }
                else if (_context.User.FirstOrDefault(user => user.Username == newUser.Username) != null || newUser.Username.ToLower().StartsWith("admin"))
                {
                    return BadRequest(new Error { Message = "This username already exists;<br>Please choose a different one", ECode = "0xUserCRegister" });
                } else
                {
                    return BadRequest(new Error { Message = "Something went wrong", ECode = "0xUserCRegister" });
                }
            }
            catch (Exception e)
            {
                return BadRequest(new Error { Message = e.Message, ECode = "0xUserCRegister" });
            }
        }


        // PUT: auth/api/user/id
        // Updates the user with the given id - Only for admins and the user itself
        [HttpPut("{id}")]
        [Authorize]
        public IActionResult Put(string id, [FromBody] UpdateUserRequest updateDto)
        {
            try
            {
                string? role = User.FindFirstValue(ClaimTypes.Role);
                Guid? requestingId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber));
                User user = _context.User.Find(requestingId);
                
                if (role == "admin" || requestingId == Guid.Parse(id))
                {
                    if (_context.User.FirstOrDefault(user => user.Username == updateDto.Username) != null && user.Username != updateDto.Username)
                    {
                        return BadRequest(new Error { Message = "Username already in use", ECode = "0xUserCPut" });
                    }
                    if (_context.User.FirstOrDefault(user => user.Email == updateDto.Email) != null && user.Email != updateDto.Email)
                    {
                        return BadRequest(new Error { Message = "Email already in use", ECode = "0xUserCPut" });
                    }
                    
                    string oldUsername = user.Username;
                    
                    // update issues with new username
                    if (user.Username != updateDto.Username)
                    {
                        foreach (var issue in _context.Issue.Where(i => i.CreatedBy == oldUsername)) {
                            issue.CreatedBy = updateDto.Username;
                            _context.Issue.Update(issue);
                        }
                        _context.SaveChanges();
                    }

                    user.Firstname = updateDto.Firstname;
                    user.Lastname = updateDto.Lastname;
                    user.Username = updateDto.Username.Replace(' ', '-');
                    user.Email = updateDto.Email;
                    _context.User.Update(user);
                    _context.SaveChanges();

                    return Ok(new {user.Id, user.Email, user.Username, user.Firstname, user.Lastname, user.Role});
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception e)
            {
                return BadRequest(new Error { Message = e.Message, ECode = "0xUserCPut" });
            }
        }
        
        // Post: auth/api/user/id/promote
        // Promotes the user with the given id to admin - Only for admins
        [HttpPost("{id}/promote")]
        [Authorize]
        public IActionResult Promote(Guid id)
        {
            try
            {
                string? role = User.FindFirstValue(ClaimTypes.Role);
                if (role == "admin")
                {
                    User user = _context.User.Find(id);
                    user.Role = "admin";
                    _context.User.Update(user);
                    _context.SaveChanges();
                    return Ok(new {user.Id, user.Email, user.Username, user.Firstname, user.Lastname, user.Role, user.Issues});
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception e)
            {
                return BadRequest(new Error { Message = e.Message, ECode = "0xUserCPromote" });
            }
        }


        // DELETE: auth/api/user/id
        // Deletes the user with the given id - Only for admins and the user itself
        [HttpDelete("{id}")]
        [Authorize]
        public IActionResult Delete(Guid id)
        {
            try
            {
                string? role = User.FindFirstValue(ClaimTypes.Role);
                Guid? requestingId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber));

                if (role == "admin" || requestingId == id)
                {
                    var user = _context.User.Include(u => u.Issues).FirstOrDefault(u => u.Id == id);
                    if (user != null)
                    {
                        _context.Issue.RemoveRange(user.Issues);
                        _context.User.Remove(user);
                        _context.SaveChanges();
                        return Ok();
                    }
                    return NotFound(new Error { Message = "User not found", ECode = "0xUserCDelete" });
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception e)
            {
                return BadRequest(new Error { Message = e.Message, ECode = "0xUserCDelete" });
            }
        }

        
        // POST: auth/api/token
        // Checks if the token has been implemented correctly
        [HttpPost("/auth/api/token")]
        [Authorize]
        public IActionResult Token()
        { 
            return Ok(new { Role = User.FindFirstValue(ClaimTypes.Role), UserId = User.FindFirstValue(ClaimTypes.SerialNumber) });
        }



        private UserToken CreateToken(Guid userId, string username, string role)
        {
            var expires = DateTime.UtcNow.AddDays(5);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.SerialNumber, Convert.ToString(userId)),
                    new Claim(ClaimTypes.Name, username),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, role)
                }
            ),
                Expires = expires,
                Issuer = JwtConfiguration.ValidIssuer,
                Audience = JwtConfiguration.ValidAudience,
                SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtConfiguration.IssuerSigningKey)),
                SecurityAlgorithms.HmacSha512Signature)
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var jwtToken = tokenHandler.WriteToken(token);
            return new UserToken { Username = username, Role = role, ExpiresAt = expires, JWT = jwtToken };
        }
    }
}