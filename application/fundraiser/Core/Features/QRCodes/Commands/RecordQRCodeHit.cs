using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Commands;

[PublicAPI]
public sealed record RecordQRCodeHitCommand : ICommand, IRequest<Result>
{
    public required QRCodeId Id { get; init; }

    public string? UserAgent { get; init; }

    public string? Referrer { get; init; }

    public string? IpAddress { get; init; }
}

public sealed class RecordQRCodeHitHandler(
    IQRCodeRepository qrCodeRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<RecordQRCodeHitCommand, Result>
{
    public async Task<Result> Handle(RecordQRCodeHitCommand command, CancellationToken cancellationToken)
    {
        var qrCode = await qrCodeRepository.GetByIdAsync(command.Id, cancellationToken);
        if (qrCode is null) return Result.NotFound($"QR code with id '{command.Id}' not found.");

        if (!qrCode.IsActive) return Result.BadRequest("QR code is deactivated.");

        qrCode.RecordHit(command.UserAgent, command.Referrer, command.IpAddress);
        qrCodeRepository.Update(qrCode);

        events.CollectEvent(new QRCodeHitRecorded(qrCode.Id, qrCode.HitCount));
        return Result.Success();
    }
}
