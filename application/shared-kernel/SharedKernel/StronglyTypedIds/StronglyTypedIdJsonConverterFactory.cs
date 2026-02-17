using System.Text.Json;
using System.Text.Json.Serialization;

namespace PlatformPlatform.SharedKernel.StronglyTypedIds;

/// <summary>
/// Registers strongly typed ID JSON converters for all StronglyTypedId&lt;,&gt; implementations.
/// This ensures IDs are serialized/deserialized as scalar values (e.g. string IDs) instead of object wrappers.
/// </summary>
public sealed class StronglyTypedIdJsonConverterFactory : JsonConverterFactory
{
    public override bool CanConvert(Type typeToConvert)
    {
        return GetStronglyTypedIdBaseType(typeToConvert) is not null;
    }

    public override JsonConverter CreateConverter(Type typeToConvert, JsonSerializerOptions options)
    {
        var stronglyTypedIdBaseType = GetStronglyTypedIdBaseType(typeToConvert)
            ?? throw new InvalidOperationException($"Type '{typeToConvert.FullName}' is not a strongly typed ID.");

        var valueType = stronglyTypedIdBaseType.GetGenericArguments()[0];
        var converterType = typeof(StronglyTypedIdJsonConverter<,>).MakeGenericType(valueType, typeToConvert);
        return (JsonConverter)Activator.CreateInstance(converterType)!;
    }

    private static Type? GetStronglyTypedIdBaseType(Type type)
    {
        Type? current = type;
        while (current is not null)
        {
            if (current.IsGenericType && current.GetGenericTypeDefinition() == typeof(StronglyTypedId<,>))
            {
                return current;
            }

            current = current.BaseType;
        }

        return null;
    }
}
