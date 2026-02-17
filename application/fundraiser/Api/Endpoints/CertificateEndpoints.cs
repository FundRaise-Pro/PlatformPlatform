using PlatformPlatform.Fundraiser.Features.Certificates.Commands;
using PlatformPlatform.Fundraiser.Features.Certificates.Domain;
using PlatformPlatform.Fundraiser.Features.Certificates.Queries;
using PlatformPlatform.SharedKernel.ApiResults;
using PlatformPlatform.SharedKernel.Endpoints;

namespace PlatformPlatform.Fundraiser.Api.Endpoints;

public sealed class CertificateEndpoints : IEndpoints
{
    private const string RoutesPrefix = "/api/fundraiser/certificates";

    public void MapEndpoints(IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup(RoutesPrefix)
            .WithTags("Certificates").RequireAuthorization().ProducesValidationProblem();

        // Templates
        group.MapGet("/templates", async Task<ApiResult<CertificateTemplateSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetCertificateTemplatesQuery()))
            .Produces<CertificateTemplateSummaryResponse[]>();

        group.MapGet("/templates/{id}", async Task<ApiResult<CertificateTemplateResponse>> (CertificateTemplateId id, IMediator mediator)
            => await mediator.Send(new GetCertificateTemplateQuery(id)))
            .Produces<CertificateTemplateResponse>();

        group.MapPost("/templates", async Task<ApiResult<CertificateTemplateId>> (CreateCertificateTemplateCommand command, IMediator mediator)
            => await mediator.Send(command))
            .Produces<CertificateTemplateId>();

        group.MapPut("/templates/{id}", async Task<ApiResult> (CertificateTemplateId id, UpdateCertificateTemplateCommand command, IMediator mediator)
            => await mediator.Send(command with { Id = id }));

        // Eligibility check (ungated)
        group.MapGet("/eligibility/{taxYear}", async Task<ApiResult<CertificateEligibilityResponse>> (int taxYear, IMediator mediator)
            => await mediator.Send(new GetCertificateEligibilityQuery(taxYear)))
            .Produces<CertificateEligibilityResponse>();

        // Batches
        group.MapGet("/batches", async Task<ApiResult<CertificateBatchSummaryResponse[]>> (IMediator mediator)
            => await mediator.Send(new GetCertificateBatchesQuery()))
            .Produces<CertificateBatchSummaryResponse[]>();

        group.MapGet("/batches/{id}", async Task<ApiResult<CertificateBatchResponse>> (CertificateIssuanceBatchId id, IMediator mediator)
            => await mediator.Send(new GetCertificateBatchQuery(id)))
            .Produces<CertificateBatchResponse>();

        // Generate certificates (premium-gated)
        group.MapPost("/generate", async Task<ApiResult<CertificateIssuanceBatchId>> (GenerateCertificatesCommand command, IMediator mediator)
            => await mediator.Send(command))
            .Produces<CertificateIssuanceBatchId>();
    }
}
