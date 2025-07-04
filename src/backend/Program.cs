using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

#region Register DI dependencies

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
builder.Services.AddControllers();

builder.Services.AddDbContext<Context>(options =>
{
    var defaultDbConnectionString = builder.Configuration.GetConnectionString("DefaultConnection")?.Trim();
    if (string.IsNullOrEmpty(defaultDbConnectionString))
    {
        throw new FaultyAppsettingsException(FaultyAppsettingsReason.MissingKey, "DefaultConnection is not configured in appsettings.[Development.|Production.]json. Please do that before running the application.");
    }
    options.UseSqlServer(defaultDbConnectionString);
});

builder.Services.AddTransient<DbInitializer>();

var corsSettings = builder.Configuration.GetSection("Cors");
var allowedOrigins = corsSettings.GetSection("Origins").Get<string[]>();
var allowedHeaders = corsSettings.GetSection("Headers").Get<string[]>();
var allowedMethods = corsSettings.GetSection("Methods").Get<string[]>();
if (allowedOrigins == null || allowedOrigins.Length == 0)
{
    throw new FaultyAppsettingsException(FaultyAppsettingsReason.MissingKey, "CORS Origins are not configured in appsettings.[Development.|Production.]json. Please do that before running the application.");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS_CONFIG", cors =>
    {
        cors.WithOrigins(allowedOrigins)
            .WithHeaders(allowedHeaders ?? new[] { "*" })
            .WithMethods(allowedMethods ?? new[] { "*" });
    });
});

// Initialize JwtHelper
JwtHelper.Initialize(builder.Configuration);

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
        ValidIssuer = JwtHelper.ValidIssuer,
        ValidAudience = JwtHelper.ValidAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtHelper.IssuerSigningKey)),
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
app.MapControllers();
app.UseCors("CORS_CONFIG");

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<DbInitializer>().Run();
}

app.UseAuthentication();
app.UseAuthorization();

app.Run();

#endregion