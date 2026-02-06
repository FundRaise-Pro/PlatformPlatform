using FluentValidation;
using PlatformPlatform.Fundraiser.Features.Applications.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Applications.Commands;

[PublicAPI]
public sealed record SetApplicationFieldDataCommand : ICommand, IRequest<Result>
{
    public required FundraisingApplicationId Id { get; init; }

    public required string FieldName { get; init; }

    public string? FieldValue { get; init; }

    public string? FieldType { get; init; }
}

public sealed class SetApplicationFieldDataValidator : AbstractValidator<SetApplicationFieldDataCommand>
{
    public SetApplicationFieldDataValidator()
    {
        RuleFor(x => x.FieldName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.FieldValue).MaximumLength(2000);
    }
}

public sealed class SetApplicationFieldDataHandler(
    IFundraisingApplicationRepository applicationRepository,
    ITelemetryEventsCollector events
) : IRequestHandler<SetApplicationFieldDataCommand, Result>
{
    public async Task<Result> Handle(SetApplicationFieldDataCommand command, CancellationToken cancellationToken)
    {
        var application = await applicationRepository.GetByIdAsync(command.Id, cancellationToken);
        if (application is null) return Result.NotFound($"Application with id '{command.Id}' not found.");

        if (!application.IsMutable) return Result.BadRequest("Application is not editable in its current state.");

        application.SetFieldData(command.FieldName, command.FieldValue, command.FieldType);
        applicationRepository.Update(application);

        events.CollectEvent(new ApplicationFieldDataSet(application.Id, command.FieldName));
        return Result.Success();
    }
}
