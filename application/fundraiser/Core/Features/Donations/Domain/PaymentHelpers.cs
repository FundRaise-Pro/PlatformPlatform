namespace PlatformPlatform.Fundraiser.Features.Donations.Domain;

/// <summary>
///     Canonical amount-handling utilities for the payment domain.
///     All amounts are stored in the tenant's currency (ZAR by default) as decimal in rands, not cents.
///     PayFast uses rands with cents as decimals (e.g., 150.00).
/// </summary>
public static class PaymentHelpers
{
    /// <summary>
    ///     Rounds a monetary amount to 2 decimal places using banker's rounding away from zero.
    /// </summary>
    public static decimal RoundAmount(decimal amount) =>
        Math.Round(amount, 2, MidpointRounding.AwayFromZero);
}
