using PlatformPlatform.AccountManagement.Features.Subscriptions.Commands;
using PlatformPlatform.AccountManagement.Features.Subscriptions.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.AccountManagement.Api.Endpoints;

public sealed class SubscriptionEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/account-management/subscriptions";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Subscriptions").RequireAuthorization().ProducesValidationProblem();

        group.MapGet("/current", async Task<ApiResult<SubscriptionResponse>> (IMediator mediator)
            => await mediator.Send(new GetSubscriptionQuery())
        ).Produces<SubscriptionResponse>();

        group.MapGet("/plans", async Task<ApiResult<PlanLimitsResponse>> (IMediator mediator)
            => await mediator.Send(new GetPlanLimitsQuery())
        ).Produces<PlanLimitsResponse>();

        group.MapPost("/checkout-session", async Task<ApiResult<CheckoutSessionResponse>> (CreateCheckoutSessionCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<CheckoutSessionResponse>();

        group.MapPut("/change-plan", async Task<ApiResult> (ChangePlanCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapDelete("/cancel", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new CancelSubscriptionCommand())
        );

        // Stripe webhook — anonymous, signature-verified
        routes.MapPost(
            $"{RoutesPrefix}/webhook",
            async Task<ApiResult> (HttpContext context, IMediator mediator) =>
            {
                var payload = await new StreamReader(context.Request.Body).ReadToEndAsync();
                var signature = context.Request.Headers["Stripe-Signature"].FirstOrDefault() ?? string.Empty;
                return await mediator.Send(new ProcessStripeWebhookCommand(payload, signature));
            }
        ).WithTags("Subscriptions").AllowAnonymous();

        // Internal API — used by other SCSes (e.g., fundraiser) for plan feature gating
        routes.MapGet(
            "/internal-api/account-management/subscriptions/by-tenant/{tenantId}",
            async Task<ApiResult<SubscriptionInfoResponse>> (TenantId tenantId, IMediator mediator)
                => await mediator.Send(new GetSubscriptionByTenantQuery(tenantId))
        ).WithTags("Subscriptions").AllowAnonymous();
    }
}
