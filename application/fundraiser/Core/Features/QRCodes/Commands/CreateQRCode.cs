using FluentValidation;
using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Commands;

[PublicAPI]
public sealed record CreateQRCodeCommand : ICommand, IRequest<Result<QRCodeId>>
{
    public required string Name { get; init; }

    public required string RedirectUrl { get; init; }

    public required QRCodeType QRCodeType { get; init; }
}

public sealed class CreateQRCodeValidator : AbstractValidator<CreateQRCodeCommand>
{
    public CreateQRCodeValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.RedirectUrl).NotEmpty().MaximumLength(1000);
    }
}

public sealed class CreateQRCodeHandler(
    IQRCodeRepository qrCodeRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CreateQRCodeCommand, Result<QRCodeId>>
{
    public async Task<Result<QRCodeId>> Handle(CreateQRCodeCommand command, CancellationToken cancellationToken)
    {
        var qrCode = QRCode.Create(
            executionContext.TenantId!, command.Name, command.RedirectUrl, command.QRCodeType
        );

        await qrCodeRepository.AddAsync(qrCode, cancellationToken);

        events.CollectEvent(new QRCodeCreated(qrCode.Id, command.QRCodeType));
        return qrCode.Id;
    }
}
