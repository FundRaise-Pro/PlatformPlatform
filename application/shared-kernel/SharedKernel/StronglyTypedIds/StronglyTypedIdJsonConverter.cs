using System.Text.Json;
using System.Globalization;

namespace PlatformPlatform.SharedKernel.StronglyTypedIds;

public class StronglyTypedIdJsonConverter<TValue, TStronglyTypedId> : JsonConverter<TStronglyTypedId>
    where TStronglyTypedId : StronglyTypedId<TValue, TStronglyTypedId>
    where TValue : IComparable<TValue>
{
    public override TStronglyTypedId? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        string? stringValue;

        switch (reader.TokenType)
        {
            case JsonTokenType.Null:
                return null;
            case JsonTokenType.String:
                stringValue = reader.GetString();
                break;
            case JsonTokenType.Number:
                // Support numeric IDs (e.g. StronglyTypedLongId) by normalizing to string for TryParse.
                stringValue = reader.GetDecimal().ToString(CultureInfo.InvariantCulture);
                break;
            case JsonTokenType.StartObject:
            {
                // Backward compatibility: accept wrapped payloads like { "value": "cmp_..." }.
                using var document = JsonDocument.ParseValue(ref reader);
                if (!TryGetValueProperty(document.RootElement, out var valueElement))
                {
                    throw new JsonException(
                        $"Object payload for {typeof(TStronglyTypedId).Name} must contain a 'value' property.");
                }

                stringValue = valueElement.ValueKind switch
                {
                    JsonValueKind.String => valueElement.GetString(),
                    JsonValueKind.Number => valueElement.GetDecimal().ToString(CultureInfo.InvariantCulture),
                    JsonValueKind.Null => null,
                    _ => throw new JsonException($"Unsupported 'value' token '{valueElement.ValueKind}' for {typeof(TStronglyTypedId).Name}.")
                };
                break;
            }
            default:
                throw new JsonException($"Unsupported token '{reader.TokenType}' for {typeof(TStronglyTypedId).Name}.");
        }

        if (stringValue is null)
        {
            return null;
        }

        // First try the concrete type's TryParse method
        var tryParseMethod = typeToConvert.GetMethod("TryParse", [typeof(string), typeToConvert.MakeByRefType()]);
        if (tryParseMethod is not null)
        {
            var parameters = new object?[] { stringValue, null };
            if ((bool)tryParseMethod.Invoke(null, parameters)!)
            {
                return (TStronglyTypedId?)parameters[1];
            }
        }

        // If that fails, try the base type's TryParse method
        var baseType = typeToConvert.BaseType;
        var baseTryParseMethod = baseType?.GetMethod("TryParse", [typeof(string), typeToConvert.MakeByRefType()]);
        if (baseTryParseMethod is not null)
        {
            var parameters = new object?[] { stringValue, null };
            if ((bool)baseTryParseMethod.Invoke(null, parameters)!)
            {
                return (TStronglyTypedId?)parameters[1];
            }
        }

        throw new JsonException($"Unable to convert {typeof(TStronglyTypedId).Name}.");
    }

    private static bool TryGetValueProperty(JsonElement element, out JsonElement valueElement)
    {
        if (element.TryGetProperty("value", out valueElement))
        {
            return true;
        }

        foreach (var property in element.EnumerateObject())
        {
            if (string.Equals(property.Name, "value", StringComparison.OrdinalIgnoreCase))
            {
                valueElement = property.Value;
                return true;
            }
        }

        valueElement = default;
        return false;
    }

    public override void Write(Utf8JsonWriter writer, TStronglyTypedId value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString());
    }
}
