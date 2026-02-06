using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PlatformPlatform.Fundraiser.Database;
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
            return services
                .AddSharedServices<FundraiserDbContext>([Assembly]);
        }
    }
}
