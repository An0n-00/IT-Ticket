/// <summary>
/// This class is used to store the JWT configuration settings from the appsettings.json file.
/// </summary>
public static class JwtHelper
{
    public static string ValidIssuer { get; private set; } = null!;
    public static string ValidAudience { get; private set; } = null!;
    public static string IssuerSigningKey { get; private set; } = null!;

    /// <summary>
    /// Initializes the JwtHelper with values from the configuration.
    /// </summary>
    /// <param name="configuration">The application configuration.</param>
    public static void Initialize(IConfiguration configuration)
    {
        var jwtSection = configuration.GetSection("Jwt");
        ValidIssuer = jwtSection["ValidIssuer"] ?? throw new Exception("ValidIssuer is not configured.");
        ValidAudience = jwtSection["ValidAudience"] ?? throw new Exception("ValidAudience is not configured.");
        IssuerSigningKey = jwtSection["IssuerSigningKey"] ?? throw new Exception("IssuerSigningKey is not configured.");
    }
}