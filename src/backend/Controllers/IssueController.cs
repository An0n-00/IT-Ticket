using System.Security.Claims;
using M295.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace M295.Controllers
{
    [Route("api/[controller]")]
    [Produces("application/json")]
    [ApiController]
    [Authorize]
    public class IssueController : ControllerBase
    {
        private readonly Context _context;

        public IssueController(Context context)
        {
            _context = context;
        }


        // GET: api/Issues/all : api/Issue/all?status=Open&limit=10&priority=High&createdBy=GUID&page=2&sort=newest&query=string
        // Returns all issues - Only for users or admins
        // check for url params to filter issues and limit the number of issues returned
        [HttpGet("all")]
        public IActionResult Get([FromQuery] string? status, [FromQuery] int? limit, [FromQuery] string? priority, [FromQuery] Guid? createdBy, [FromQuery] int? page, [FromQuery] string? sort, [FromQuery] string? query)
        {
            // Filter issues by status if provided
            var issues = _context.Issue.AsQueryable();
            if (!string.IsNullOrEmpty(status))
            {
                status = System.Net.WebUtility.UrlDecode(status);
                status = status.Replace(' ', '-');
                if (status.StartsWith('!'))
                {
                    status = status.Substring(1);
                    issues = issues.Where(i => i.Status.ToLower() != status.ToLower());
                }
                else
                {
                    issues = issues.Where(i => i.Status.ToLower() == status.ToLower());
                }
            }
        
            // Filter issues by priority if provided
            if (!string.IsNullOrEmpty(priority))
            {
                priority = System.Net.WebUtility.UrlDecode(priority);
                if (priority.StartsWith('!'))
                {
                    priority = priority.Substring(1);
                    issues = issues.Where(i => i.Priority.ToLower() != priority.ToLower());
                }
                else
                {
                    issues = issues.Where(i => i.Priority.ToLower() == priority.ToLower());
                }
            }
        
            // Filter issues by createdBy if provided
            if (createdBy != null)
            {
                issues = issues.Where(i => i.UserId == createdBy);
            }
            
            // Sort the issues by newest if provided
            if (sort == "newest")
            {
                issues = issues.OrderByDescending(i => i.CreatedDate);
            }
        
            // Paginate the issues if page and limit are provided
            if (page.HasValue && limit.HasValue)
            {
                issues = issues.Skip((page.Value - 1) * limit.Value).Take(limit.Value);
            } else if (limit.HasValue)
            {
                issues = issues.Take(limit.Value);
            }
            
            // Filter issues by query if provided
            if (!string.IsNullOrEmpty(query))
            {
                query = System.Net.WebUtility.UrlDecode(query).ToLower();
                issues = issues.Where(i => i.Title.ToLower().Contains(query) || i.Description.ToLower().Contains(query));
            }
            
            return Ok(issues.ToList());
        }


        // GET: api/Issues/GUID
        // Returns the issue with the given guid - Only for users or admins
        [HttpGet("{id}")]
        public IActionResult Get(Guid id)
        {
            var issue = _context.Issue.Find(id);
            if (issue == null)
            {
                return NotFound();
            }
            return Ok(issue);
        }


        // POST: api/issue
        // Creates a new issue - Only for users or admins
        [HttpPost]
        public IActionResult Post([FromBody] CreateIssueRequest request)
        {
            var newIssue = new Issue
            {
                Title = request.Title,
                Description = request.Description,
                Priority = request.Priority,
                UserId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber)),
                CreatedBy = User.FindFirstValue(ClaimTypes.Name)
            };
    
            try
            {
                var dbIssue = _context.Issue.Add(newIssue);
                _context.SaveChanges();
                return Ok(dbIssue.Entity);
            }
            catch (Exception e)
            {
                return BadRequest(e);
            }
        }

        

        // PUT: api/Issues/GUID
        // Updates the issue with the given guid - Only for admins or the user itself
        [HttpPut("{id}")]
        public IActionResult Put(Guid id, [FromBody] EditIssueRequest issue)
        {
            string? role = User.FindFirstValue(ClaimTypes.Role);
            Guid? requestingId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber));
            Issue? dbIssue = _context.Issue.Find(id);

            if (dbIssue == null)
            {
                return Unauthorized();
            }

            bool isAdmin = role == "admin";
            bool isOwner = requestingId == dbIssue.UserId;

            if (!isAdmin && !isOwner)
            {
                return Unauthorized();
            }
            
            try {
                dbIssue.Title = issue.Title;
                dbIssue.Description = issue.Description;
                
                if (role == "admin")
                {
                    dbIssue.Status = issue.Status;
                }

                if (dbIssue.Status.ToLower().Replace(" ", "-") == "closed")
                {
                    dbIssue.ResolvedDate = DateTime.Now;
                }
                
                dbIssue.Priority = issue.Priority;
                dbIssue.UpdatedDate = DateTime.Now;
                _context.SaveChanges();
                return Ok(dbIssue);
            } catch (Exception e) {
                return BadRequest(e);
            }
        }


        // DELETE: api/Issues/GUID
        // Deletes the issue with the given guid - Only for admins or the user itself
        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            string role = User.FindFirstValue(ClaimTypes.Role);
            Guid requestingId = new Guid(User.FindFirstValue(ClaimTypes.SerialNumber));

            var dbIssue = _context.Issue.Find(id);
            if (dbIssue == null || (role != "admin" && requestingId != dbIssue.UserId))
            {
                return Unauthorized();
            }

            _context.Issue.Remove(dbIssue);
            _context.SaveChanges();
            return Ok();
        }
    }
}