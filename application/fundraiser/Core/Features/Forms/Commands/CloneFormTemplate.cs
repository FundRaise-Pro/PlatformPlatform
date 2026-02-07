using System.Collections.Immutable;
using PlatformPlatform.Fundraiser.Features.Forms.Domain;
using PlatformPlatform.SharedKernel.Cqrs;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Telemetry;

namespace PlatformPlatform.Fundraiser.Features.Forms.Commands;

[PublicAPI]
public sealed record CloneFormTemplateCommand(FormTemplateId TemplateId) : ICommand, IRequest<Result<FormVersionId>>;

public sealed class CloneFormTemplateHandler(
    IFormTemplateRepository formTemplateRepository,
    IFormVersionRepository formVersionRepository,
    IExecutionContext executionContext,
    ITelemetryEventsCollector events
) : IRequestHandler<CloneFormTemplateCommand, Result<FormVersionId>>
{
    public async Task<Result<FormVersionId>> Handle(CloneFormTemplateCommand command, CancellationToken cancellationToken)
    {
        var template = await formTemplateRepository.GetByIdAsync(command.TemplateId, cancellationToken);
        if (template is null)
            return Result<FormVersionId>.NotFound($"Form template '{command.TemplateId}' not found.");

        if (!template.IsPublished)
            return Result<FormVersionId>.BadRequest($"Form template '{command.TemplateId}' is not published.");

        var formVersion = FormVersion.Create(
            executionContext.TenantId!,
            "1.0",
            $"{template.Name} (from template)",
            template.Description
        );

        // Clone sections from the template into the form version
        foreach (var section in template.Sections)
        {
            var newSection = formVersion.AddSection(section.Name, section.Title, section.DisplayOrder, section.Description, section.Icon);

            foreach (var field in section.Fields)
            {
                newSection.AddField(field.Name, field.Label, field.FieldType, field.DefaultValue,
                    field.DisplayOrder, field.IsRequired, field.Placeholder, field.ValidationRules, field.Options);
            }

            foreach (var flag in section.Flags)
            {
                newSection.AddFlag(flag.Name, flag.Question, flag.DisplayOrder, flag.IsRequired, flag.HelpText);
            }
        }

        template.IncrementCloneCount();

        await formVersionRepository.AddAsync(formVersion, cancellationToken);
        formTemplateRepository.Update(template);

        events.CollectEvent(new FormTemplateCloned(template.Id, formVersion.Id));
        return formVersion.Id;
    }
}
