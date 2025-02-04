using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace M295.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string? Firstname { get; set; }
        public string? Lastname { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Role { get; set; } = "user";
        public string Salt { get; set; } = "";

        public virtual ICollection<Issue>? Issues { get; set; }
    }
}
