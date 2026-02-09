using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Applications.Commands;

[PublicAPI]
public sealed record SubmitApplicationCommand(FundraisingApplicationId Id) : ICommand, IRequest<Result>;

public sealed class SubmitApplicationHandler(
    IFundraisingApplicationRepository applicationRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<SubmitApplicationCommand, Result>
{
    public async Task<Result> Handle(SubmitApplicationCommand command, CancellationToken cancellationToken)
    {
        var application = await applicationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (application is null) return Result.NotFound($"Application with id '{command.Id}' not found.");

        if (!application.IsMutable) return Result.BadRequest("Application has already been submitted.");

        application.Submit();
        applicationRepository.Update(application);

        events.CollectEvent(new ApplicationSubmitted(application.Id));
        return Result.Success();
    }
}
