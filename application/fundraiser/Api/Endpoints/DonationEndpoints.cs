using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class DonationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/donations";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Donations").RequireAuthorization().ProducesValidationProblem();

        // TODO: Phase 1 — Implement donation and payment flow
        // group.MapGet("/", ...) — List donations
        // group.MapPost("/", ...) — Create donation (initiate payment)
        // group.MapPost("/callback", ...) — Payment gateway callback (PayFast ITN)
        // group.MapGet("/transactions", ...) — List transactions
        // group.MapGet("/subscriptions", ...) — List subscriptions
        // group.MapPost("/subscriptions", ...) — Create recurring subscription
        // group.MapDelete("/subscriptions/{id}", ...) — Cancel subscription
    }
}
