using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PlatformPlatform.Fundraiser.Database;
using PlatformPlatform.Fundraiser.Features.Subscriptions;
using PlatformPlatform.Fundraiser.Integrations.AccountManagement;
using PlatformPlatform.Fundraiser.Integrations.BlobStorage;
using PlatformPlatform.Fundraiser.Integrations.PaymentGateway;
using PlatformPlatform.SharedKernel.Configuration;

namespace PlatformPlatform.Fundraiser;

public static class Configuration
{
    public static Assembly Assembly => Assembly.GetExecutingAssembly();

    extension(IHostApplicationBuilder builder)
    {
        public IHostApplicationBuilder AddFundraiserInfrastructure()
        {
            return builder
                .AddSharedInfrastructure<FundraiserDbContext>("fundraiser-database")
                .AddNamedBlobStorages([("fundraiser-storage", "BLOB_STORAGE_URL")]);
        }
    }

    extension(IServiceCollection services)
    {
        public IServiceCollection AddFundraiserServices()
        {
            services
                .AddSharedServices<FundraiserDbContext>([Assembly]);

            // Account management client for cross-SCS subscription lookups
            services.AddHttpClient<AccountManagementClient>(client =>
            {
                client.BaseAddress = new Uri("http://account-management-api");
                client.Timeout = TimeSpan.FromSeconds(10);
            });

            // Plan feature guard and usage tracking
            services.AddMemoryCache();
            services.AddScoped<PlanFeatureGuard>();
            services.AddScoped<UsageTracker>();

            // Payment gateway registrations
            services.AddHttpClient<PayFastGateway>(client =>
            {
                client.BaseAddress = new Uri("https://www.payfast.co.za/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });
            services.AddHttpClient<StripeGateway>(client =>
            {
                client.BaseAddress = new Uri("https://api.stripe.com/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });
            services.AddHttpClient<PayPalGateway>(client =>
            {
                client.BaseAddress = new Uri("https://api.paypal.com/");
                client.Timeout = TimeSpan.FromSeconds(30);
            });

            services.AddSingleton<IPaymentGateway>(sp => sp.GetRequiredService<PayFastGateway>());
            services.AddSingleton<IPaymentGateway>(sp => sp.GetRequiredService<StripeGateway>());
            services.AddSingleton<IPaymentGateway>(sp => sp.GetRequiredService<PayPalGateway>());
            services.AddScoped<PaymentGatewayFactory>();

            // Tenant blob storage isolation
            services.AddScoped<TenantBlobStorageService>();

            return services;
        }
    }
}
