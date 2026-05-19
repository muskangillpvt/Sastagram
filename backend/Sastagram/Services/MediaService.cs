using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace Sastagram.Services;

public interface IMediaService
{
    Task<(string Url, string PublicId, int Width, int Height)> UploadImageAsync(IFormFile file, string folder);
    Task<(string Url, string PublicId)> UploadVideoAsync(IFormFile file, string folder);
    Task DeleteMediaAsync(string publicId);
}

public class CloudinaryMediaService : IMediaService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryMediaService(IConfiguration config)
    {
        var cloudinaryConfig = config.GetSection("Cloudinary");
        var account = new Account(
            cloudinaryConfig["CloudName"],
            cloudinaryConfig["ApiKey"],
            cloudinaryConfig["ApiSecret"]
        );
        _cloudinary = new Cloudinary(account);
    }

    public async Task<(string Url, string PublicId, int Width, int Height)> UploadImageAsync(IFormFile file, string folder)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"sastagram/{folder}",
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Cloudinary upload failed: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId, result.Width, result.Height);
    }

    public async Task<(string Url, string PublicId)> UploadVideoAsync(IFormFile file, string folder)
    {
        using var stream = file.OpenReadStream();
        var uploadParams = new VideoUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = $"sastagram/{folder}",
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
            throw new Exception($"Cloudinary upload failed: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteMediaAsync(string publicId)
    {
        var deleteParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deleteParams);
    }
}
