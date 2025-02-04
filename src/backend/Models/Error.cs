    using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace M295.Models
{
    public class Error
    {
        public string Message { get; set; } = null!;
        public string ECode { get; set; } = null!;
    }
}
