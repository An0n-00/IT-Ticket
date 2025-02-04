using Microsoft.EntityFrameworkCore;
using M295.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Data.SqlClient;

static bool TestConnection(string connectionString)
{
    try
    {
        using (var connection = new SqlConnection(connectionString))
        {
            connection.Open();
            return true;
        }
    }
    catch
    {
        return false;
    }
}

#region Register DI dependencies

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
builder.Services.AddControllers();

// Register Context with a factory method
builder.Services.AddDbContext<Context>(options =>
{
    var configuration = builder.Configuration;
    var environment = builder.Environment;
    var defaultConnectionString = configuration.GetConnectionString("DefaultConnection").Replace("[Path]", environment.ContentRootPath);
    var secondaryConnectionString = configuration.GetConnectionString("SecondaryConnection");

    var connectionStringToUse = TestConnection(defaultConnectionString) ? defaultConnectionString : secondaryConnectionString;
    options.UseSqlServer(connectionStringToUse);
});

builder.Services.AddTransient<DbInitializer>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS_CONFIG", cors =>
    {
        cors.WithMethods("*")
            .WithHeaders("*")
            .WithOrigins("*");
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = JwtConfiguration.ValidIssuer,
        ValidAudience = JwtConfiguration.ValidAudience,
        IssuerSigningKey = new SymmetricSecurityKey(
    Encoding.UTF8.GetBytes(JwtConfiguration.IssuerSigningKey)),
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true
    };
});

#endregion

#region Application Startup

var app = builder.Build();

app.UseSession();
var defaultFilesOptions = new DefaultFilesOptions();
defaultFilesOptions.DefaultFileNames.Clear();
defaultFilesOptions.DefaultFileNames.Add("index.html"); //fix that it uses index.html and not default.html
app.UseDefaultFiles(defaultFilesOptions);
app.MapControllers();
app.UseStaticFiles(new StaticFileOptions()
{
    OnPrepareResponse = (context) =>
    {
        // Disable caching of all static files.
        context.Context.Response.Headers["Cache-Control"] = builder.Configuration["StaticFiles:CacheControl"];
        context.Context.Response.Headers["Pragma"] = builder.Configuration["StaticFiles:Pragma"];
        context.Context.Response.Headers["Expires"] = builder.Configuration["StaticFiles:Expires"];
    }
});

app.UseCors("CORS_CONFIG");

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<DbInitializer>().Run();
}

app.UseAuthentication();
app.UseAuthorization();

app.Run();

#endregion