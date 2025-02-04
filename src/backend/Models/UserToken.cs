public class UserToken
{
    public string Username { get; set; }
    public string Role { get; set; }
    public string JWT { get; set; }
    public DateTime ExpiresAt { get; set; }
}