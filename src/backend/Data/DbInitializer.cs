using System.Data.SqlClient;
using M295.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

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
        try
        {
            InitializeDatabaseWithDefaultConnection();
        }
        catch (Exception e)
        {
            Console.WriteLine("Primary database initialization failed: " + e.Message);
            Console.WriteLine("Attempting to use Azure database...");

            // Switch to Azure connection string
            var azureConnectionString = _configuration.GetConnectionString("SecondaryConnection");
            if (TestConnection(azureConnectionString))
            {
                InitializeDatabaseWithSecondaryConnection(azureConnectionString);
            }
            else
            {
                throw new Exception("Failed to connect to Azure database.");
            }
        }
    }

    private void InitializeDatabaseWithDefaultConnection()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<Context>();
            if (context.Database.EnsureCreated()) // generate and execute SQL DDL
            {
                InitializeDatabase(context);
            }
        }
    }

    private void InitializeDatabaseWithSecondaryConnection(string connectionString)
    {
        var optionsBuilder = new DbContextOptionsBuilder<Context>();
        optionsBuilder.UseSqlServer(connectionString);
        using (var azureContext = new Context(optionsBuilder.Options))
        {
            InitializeDatabase(azureContext);
        }
    }

    private bool TestConnection(string connectionString)
    {
        try
        {
            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                Console.WriteLine("Connection to Azure database successful.");
                return true;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("Connection to Azure database failed: " + ex.Message);
            return false;
        }
    }

    private void InitializeDatabase(Context context)
    {
        string salt;
        string pwHash = HashGenerator.GenerateHash("9ecc60bddbf814929e11e0d4db2e209a34bd99b6b85fc0444be9c60c5f8fe86d", out salt);
        // Schoggi123 - hashed with frontend logic
        User admin = new User
        {
            Username = "Administrator",
            Password = pwHash,
            Salt = salt,
            Email = "Admin@IT-Ticket.com".ToLower(),
            Role = "admin"
        };
        context.User.Add(admin);
        context.SaveChanges();

        context.Issue.Add(
            new Issue
            {
                Title = "Einkaufen",
                Description = "Brot, Energy Drink, Süsszeug, Salat",
                Status = "Open",
                Priority = "High",
                CreatedBy = admin.Username,
                CreatedDate = DateTime.Now,
                User = admin
            });
        // store everything to database
        context.SaveChanges();
    }
}