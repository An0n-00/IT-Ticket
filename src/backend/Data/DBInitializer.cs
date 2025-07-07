/// <summary>
/// This class seeds the database with default values when it is created.
/// </summary>
public class DbInitializer
{
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;

    public DbInitializer(IConfiguration configuration, IServiceProvider serviceProvider)
    {
        _configuration = configuration;
        _serviceProvider = serviceProvider;
    }

    public void Run()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<Context>();
        try
        {
            if (context.Database.EnsureCreated())
            {
                InitializeDatabase(context);
            }
            Console.WriteLine("Successfully connected to the database.");
        }
        catch (Exception e)
        {
            throw new ControlledException(
                "Failed to connect to the database. Please check your connection string. " + e.Message,
                ECode.Database_ConnectionError);
        }
    }

    private void InitializeDatabase(Context context)
    {
        #region Create Default Roles

        var adminRole = new Role { Name = "Administrator", Description = "System administrator with full access." };
        var supportRole = new Role { Name = "Support", Description = "Support staff with access to manage issues." };
        var userRole = new Role { Name = "User", Description = "Regular user with limited access.", IsDefault = true };

        context.Roles.AddRange(adminRole, userRole);
        context.SaveChanges();

        #endregion

        #region Create Default Statuses

        var openStatus = new Status
            { Name = "Open", Description = "Issues is open and needs attention.", Color = "Red" };
        var inProgressStatus = new Status
            { Name = "In Progress", Description = "Issues is being worked on.", Color = "Yellow" };
        var resolvedStatus = new Status
            { Name = "Resolved", Description = "Issues has been resolved.", Color = "Green" };

        context.Status.AddRange(openStatus, inProgressStatus, resolvedStatus);
        context.SaveChanges();

        #endregion

        #region Create Default Tags

        var bugTag = new Tag { Name = "Bug", Description = "Issues related to bugs in the system." };
        var featureTag = new Tag { Name = "Feature", Description = "Issues related to new features." };

        #endregion

        #region Create Default Admin Users

        var admin = new User
        {
            Username = "Administrator",
            Email = "admin@it-ticket.com".ToLower(),
            Role = adminRole
        };

        var password = _configuration.GetSection("DefaultAdminPassword").Value;
        if (password == null)
        {
            throw new FaultyAppsettingsException(FaultyAppsettingsReason.MissingKey,
                "DefaultAdminPassword is not configured in appsettings.[Development.|Production.]json. Please do that before running the application.");
        }

        var pwHash = HashGenerator.GenerateHash(password, out var salt);
        admin.Password = pwHash;
        admin.Salt = salt;

        context.Users.Add(admin);
        context.SaveChanges();

        #endregion

        #region Create Default Priorities

        var highPriority = new Priority
            { Name = "High", Description = "High priority issues that need immediate attention.", Color = "Red" };
        var mediumPriority = new Priority
        {
            Name = "Medium", Description = "Medium priority issues that should be addressed soon.", Color = "Yellow"
        };
        var lowPriority = new Priority
            { Name = "Low", Description = "Low priority issues that can be addressed later.", Color = "Green" };

        context.Priorities.AddRange(highPriority, mediumPriority, lowPriority);
        context.SaveChanges();

        #endregion

        #region Create Test Issues

        var testIssue = new Issue
        {
            Title = "Test Issue",
            Description = "This is a test issue created by the DBInitializer.",
            Status = openStatus,
            Priority = highPriority,
            CreatedDate = DateTime.Now,
            User = admin,
            AssignedTo = admin,
            Comments = new List<Comment>(),
            Attachments = new List<Attachment>(),
            IssueTags = new List<IssueTag>
            {
                new IssueTag { Tag = bugTag },
                new IssueTag { Tag = featureTag }
            },
            AuditLogs = new List<AuditLog>()
        };

        context.Issues.Add(testIssue);
        context.SaveChanges();

        #endregion
    }
}