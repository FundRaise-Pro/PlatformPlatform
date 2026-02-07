using PlatformPlatform.AccountManagement.Features.Authentication.Commands;
using PlatformPlatform.AccountManagement.Features.Authentication.Domain;
using PlatformPlatform.AccountManagement.Features.Authentication.Queries;
using PlatformPlatform.AccountManagement.Features.EmailConfirmations.Commands;
using PlatformPlatform.AccountManagement.Features.EmailConfirmations.Domain;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Authentication.TokenGeneration;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.AccountManagement.Api.Endpoints;

public sealed class AuthenticationEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/account-management/authentication";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix).WithTags("Authentication").RequireAuthorization().ProducesValidationProblem();

        group.MapPost("/login/start", async Task<ApiResult<StartLoginResponse>> (StartLoginCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<StartLoginResponse>().AllowAnonymous();

        group.MapPost("/login/{id}/complete", async Task<ApiResult> (LoginId id, CompleteLoginCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id })
        ).AllowAnonymous();

        group.MapPost("/login/{emailConfirmationId}/resend-code", async Task<ApiResult<ResendEmailConfirmationCodeResponse>> (EmailConfirmationId emailConfirmationId, IMediator mediator)
            => await mediator.Send(new ResendEmailConfirmationCodeCommand { Id = emailConfirmationId })
        ).Produces<ResendEmailConfirmationCodeResponse>().AllowAnonymous();

        group.MapPost("/logout", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new LogoutCommand())
        );

        group.MapPost("/switch-tenant", async Task<ApiResult> (SwitchTenantCommand command, IMediator mediator)
            => await mediator.Send(command)
        );

        group.MapGet("/sessions", async Task<ApiResult<UserSessionsResponse>> ([AsParameters] GetUserSessionsQuery query, IMediator mediator)
            => await mediator.Send(query)
        ).Produces<UserSessionsResponse>();

        group.MapDelete("/sessions/{id}", async Task<ApiResult> (SessionId id, IMediator mediator)
            => await mediator.Send(new RevokeSessionCommand { Id = id })
        );

        // Note: This endpoint must be called with the refresh token as Bearer token in the Authorization header
        routes.MapPost("/internal-api/account-management/authentication/refresh-authentication-tokens", async Task<ApiResult> (IMediator mediator)
            => await mediator.Send(new RefreshAuthenticationTokensCommand())
        ).DisableAntiforgery();

        // --- WebAuthn / FIDO2 endpoints ---
        var webAuthnGroup = routes.MapGroup(RoutesPrefix + "/webauthn").WithTags("WebAuthn").RequireAuthorization().ProducesValidationProblem();

        webAuthnGroup.MapGet("/credentials", async Task<ApiResult<WebAuthnCredentialResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetWebAuthnCredentialsQuery())
        ).Produces<WebAuthnCredentialResponse[]>();

        webAuthnGroup.MapPost("/register", async Task<ApiResult<WebAuthnCredentialId>> (RegisterWebAuthnCredentialCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).Produces<WebAuthnCredentialId>();

        webAuthnGroup.MapPost("/authenticate", async Task<ApiResult> (AuthenticateWebAuthnCommand command, IMediator mediator)
            => await mediator.Send(command)
        ).AllowAnonymous();

        webAuthnGroup.MapDelete("/credentials/{id}", async Task<ApiResult> (WebAuthnCredentialId id, IMediator mediator)
            => await mediator.Send(new RemoveWebAuthnCredentialCommand(id))
        );
    }
}
