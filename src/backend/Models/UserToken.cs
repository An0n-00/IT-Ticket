/// <summary>
/// UserToken class represents the json structure of a successful login response.
/// </summary>
public class UserToken
{ 
    public string Username { get; set; } = null!;
    public String Role { get; set; } = null!;
    public string Jwt { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}