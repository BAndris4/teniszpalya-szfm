using System.ComponentModel.DataAnnotations;

namespace Teniszpalya.API.Models
{
    public class Coupon
    {
        [Key]
        public int ID { get; set; }
        public required string Code { get; set; }
        public required int UserID { get; set; }
        public bool Used { get; set; } = false;
    }
}