using Microsoft.EntityFrameworkCore;

namespace M295.Models
{
    public class Context : DbContext
    {
        public Context(DbContextOptions<Context> options)
            : base(options) { }

        public DbSet<Issue> Issue { get; set; } = null!;
        public DbSet<User> User { get; set; } = null!;

    }
}
