using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class QRCodeEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/qrcodes";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("QR Codes").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement QR code management
        // group.MapGet("/", ...) — List QR codes
        // group.MapGet("/{id}", ...) — Get QR code by ID
        // group.MapPost("/", ...) — Create QR code
        // group.MapPost("/{id}/hit", ...) — Record QR code hit (public, no auth)
        // group.MapPut("/{id}/deactivate", ...) — Deactivate QR code
        // group.MapGet("/{id}/analytics", ...) — Get QR code analytics
    }
}
