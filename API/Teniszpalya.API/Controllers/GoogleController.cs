using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Calendar.v3;
using Google.Apis.Services;
using Google.Apis.Util;
using Microsoft.AspNetCore.Mvc;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;

[Route("api/[controller]")]
[ApiController]
public class GoogleController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly AppDBContext _context;

    public GoogleController(IConfiguration config, AppDBContext context)
    {
        _config = config;
        _context = context;
    }

    [HttpGet("auth")]
    public IActionResult StartOAuth([FromQuery] int reservationId)
    {
        var clientId = _config["GoogleAuth:ClientId"];
        var redirectUri = _config["GoogleAuth:RedirectUri"];
        var scope = "https://www.googleapis.com/auth/calendar.events";

        var url =
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?response_type=code" +
            $"&client_id={clientId}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            $"&scope={Uri.EscapeDataString(scope)}" +
            "&access_type=offline" +
            $"&state={reservationId}";

        return Redirect(url);
    }

    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string code, string state)
    {
        var clientId = _config["GoogleAuth:ClientId"];
        var clientSecret = _config["GoogleAuth:ClientSecret"];
        var redirectUri = _config["GoogleAuth:RedirectUri"];

        var tokenResponse = await new AuthorizationCodeTokenRequest
        {
            Code = code,
            ClientId = clientId,
            ClientSecret = clientSecret,
            RedirectUri = redirectUri

        }.ExecuteAsync(
            new HttpClient(),
            "https://oauth2.googleapis.com/token",
            CancellationToken.None,
            SystemClock.Default
        );


        int reservationId = int.Parse(state);
        var reservation = await _context.Reservations.FindAsync(reservationId);

        if (reservation == null)
            return NotFound("Reservation not found.");

        await AddToCalendar(tokenResponse.AccessToken, reservation);

        return Redirect("http://localhost:5173/");
    }

    private async Task AddToCalendar(string accessToken, Reservation reservation)
    {
        var credential = GoogleCredential.FromAccessToken(accessToken);

        var service = new CalendarService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "Tennis Reservation App",
        });

        var start = DateTimeOffset.FromUnixTimeMilliseconds(reservation.ReservedAt).UtcDateTime;
        var end = start.AddHours(reservation.Hours);

        var ev = new Google.Apis.Calendar.v3.Data.Event
        {
            Summary = "Tennis Court Reservation",
            Description = $"Court #{reservation.CourtID}",
            Start = new Google.Apis.Calendar.v3.Data.EventDateTime { DateTimeDateTimeOffset = start },
            End = new Google.Apis.Calendar.v3.Data.EventDateTime { DateTimeDateTimeOffset = end }
        };

        await service.Events.Insert(ev, "primary").ExecuteAsync();
    }
}
