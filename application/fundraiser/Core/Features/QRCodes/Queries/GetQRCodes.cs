using PlatformPlatform.Fundraiser.Features.QRCodes.Domain;
using PlatformPlatform.SharedKernel.Cqrs;

namespace PlatformPlatform.Fundraiser.Features.QRCodes.Queries;

[PublicAPI]
public sealed record GetQRCodesQuery : IRequest<Result<QRCodeSummaryResponse[]>>;

[PublicAPI]
public sealed record QRCodeSummaryResponse(
    QRCodeId Id, string Name, string RedirectUrl, QRCodeType QRCodeType,
    bool IsActive, int HitCount, DateTimeOffset CreatedAt
);

[PublicAPI]
public sealed record GetQRCodeQuery(QRCodeId Id) : IRequest<Result<QRCodeResponse>>;

[PublicAPI]
public sealed record QRCodeResponse(
    QRCodeId Id, string Name, string RedirectUrl, QRCodeType QRCodeType,
    bool IsActive, int HitCount, string? QRCodeImageUrl,
    DateTimeOffset CreatedAt, DateTimeOffset? ModifiedAt,
    QRCodeHitResponse[] Hits
);

[PublicAPI]
public sealed record QRCodeHitResponse(Guid Id, DateTime HitAt, string? UserAgent, string? Referrer, string? IpAddress);

public sealed class GetQRCodesHandler(IQRCodeRepository qrCodeRepository)
    : IRequestHandler<GetQRCodesQuery, Result<QRCodeSummaryResponse[]>>
{
    public async Task<Result<QRCodeSummaryResponse[]>> Handle(GetQRCodesQuery query, CancellationToken cancellationToken)
    {
        var qrCodes = await qrCodeRepository.GetAllAsync(cancellationToken);

        return qrCodes.Select(q => new QRCodeSummaryResponse(
            q.Id, q.Name, q.RedirectUrl, q.QRCodeType, q.IsActive, q.HitCount, q.CreatedAt
        )).ToArray();
    }
}

public sealed class GetQRCodeHandler(IQRCodeRepository qrCodeRepository)
    : IRequestHandler<GetQRCodeQuery, Result<QRCodeResponse>>
{
    public async Task<Result<QRCodeResponse>> Handle(GetQRCodeQuery query, CancellationToken cancellationToken)
    {
        var q = await qrCodeRepository.GetByIdAsync(query.Id, cancellationToken);
        if (q is null) return Result<QRCodeResponse>.NotFound($"QR code with id '{query.Id}' not found.");

        return new QRCodeResponse(
            q.Id, q.Name, q.RedirectUrl, q.QRCodeType, q.IsActive, q.HitCount, q.QRCodeImageUrl,
            q.CreatedAt, q.ModifiedAt,
            q.Hits.Select(h => new QRCodeHitResponse(h.Id, h.HitAt, h.UserAgent, h.Referrer, h.IpAddress)).ToArray()
        );
    }
}
