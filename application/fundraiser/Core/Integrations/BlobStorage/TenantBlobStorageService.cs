using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.DependencyInjection;
using PlatformPlatform.SharedKernel.Domain;
using PlatformPlatform.SharedKernel.ExecutionContext;
using PlatformPlatform.SharedKernel.Integrations.BlobStorage;

namespace PlatformPlatform.Fundraiser.Integrations.BlobStorage;

/// <summary>
///     Provides per-tenant blob storage isolation by automatically prefixing container names
///     with the tenant ID. This ensures complete data isolation between tenants while sharing
///     the same underlying storage account.
/// </summary>
public sealed class TenantBlobStorageService(
    [FromKeyedServices("fundraiser-storage")] IBlobStorageClient blobStorageClient,
    IExecutionContext executionContext,
    ILogger<TenantBlobStorageService> logger
)
{
    /// <summary>Returns the tenant-scoped container name: {tenantId}-{containerSuffix}.</summary>
    private string GetTenantContainer(string containerSuffix)
    {
        var tenantId = executionContext.TenantId
            ?? throw new InvalidOperationException("TenantId is required for blob storage operations.");
        return $"{tenantId}-{containerSuffix}";
    }

    public async Task EnsureContainersExistAsync(CancellationToken cancellationToken)
    {
        var tenantId = executionContext.TenantId
            ?? throw new InvalidOperationException("TenantId is required for blob storage operations.");

        await blobStorageClient.CreateContainerIfNotExistsAsync($"{tenantId}-documents", PublicAccessType.None, cancellationToken);
        await blobStorageClient.CreateContainerIfNotExistsAsync($"{tenantId}-images", PublicAccessType.Blob, cancellationToken);

        logger.LogInformation("Ensured blob storage containers exist for tenant {TenantId}", tenantId);
    }

    public async Task UploadDocumentAsync(string blobName, string contentType, Stream stream, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("documents");
        await blobStorageClient.UploadAsync(container, blobName, contentType, stream, cancellationToken);
    }

    public async Task UploadImageAsync(string blobName, string contentType, Stream stream, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("images");
        await blobStorageClient.UploadAsync(container, blobName, contentType, stream, cancellationToken);
    }

    public async Task<(Stream Stream, string ContentType)?> DownloadDocumentAsync(string blobName, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("documents");
        return await blobStorageClient.DownloadAsync(container, blobName, cancellationToken);
    }

    public async Task<(Stream Stream, string ContentType)?> DownloadImageAsync(string blobName, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("images");
        return await blobStorageClient.DownloadAsync(container, blobName, cancellationToken);
    }

    public string GetDocumentUrl(string blobName)
    {
        var container = GetTenantContainer("documents");
        return blobStorageClient.GetBlobUrl(container, blobName);
    }

    public string GetImageUrl(string blobName)
    {
        var container = GetTenantContainer("images");
        return blobStorageClient.GetBlobUrl(container, blobName);
    }

    public Uri GetDocumentSasUri(string blobName, TimeSpan expiresIn)
    {
        var container = GetTenantContainer("documents");
        return blobStorageClient.GetBlobUriWithSharedAccessSignature(container, blobName, expiresIn);
    }

    public Uri GetImageSasUri(string blobName, TimeSpan expiresIn)
    {
        var container = GetTenantContainer("images");
        return blobStorageClient.GetBlobUriWithSharedAccessSignature(container, blobName, expiresIn);
    }

    public async Task<bool> DeleteDocumentAsync(string blobName, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("documents");
        return await blobStorageClient.DeleteIfExistsAsync(container, blobName, cancellationToken);
    }

    public async Task<bool> DeleteImageAsync(string blobName, CancellationToken cancellationToken)
    {
        var container = GetTenantContainer("images");
        return await blobStorageClient.DeleteIfExistsAsync(container, blobName, cancellationToken);
    }
}
