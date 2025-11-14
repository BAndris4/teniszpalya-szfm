namespace Teniszpalya.API.Models
{
    public class ReservationDTO
    {
        public required long CreatedAt { get; set; }
        public required long ReservedAt { get; set; }
        public required float Hours { get; set; }
        public required int CourtID { get; set; }
        public string CouponCode { get; set; } = string.Empty;
    }
}