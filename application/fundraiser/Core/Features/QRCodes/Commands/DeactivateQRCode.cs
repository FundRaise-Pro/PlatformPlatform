using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Commands;

[PublicAPI]
public sealed record DeactivateQRCodeCommand(QRCodeId Id) : ICommand, IRequest<Result>;

public sealed class DeactivateQRCodeHandler(
    IQRCodeRepository qrCodeRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<DeactivateQRCodeCommand, Result>
{
    public async Task<Result> Handle(DeactivateQRCodeCommand command, CancellationToken cancellationToken)
    {
        var qrCode = await qrCodeRepository.GetByIdAsync(command.Id, cancellationToken);
        if (qrCode is null) return Result.NotFound($"QR code with id '{command.Id}' not found.");

        qrCode.Deactivate();
        qrCodeRepository.Update(qrCode);

        events.CollectEvent(new QRCodeDeactivated(qrCode.Id));
        return Result.Success();
    }
}
