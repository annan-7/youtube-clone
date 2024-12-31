// Require the cloudinary library
import {v2 as cloudinary} from 'cloudinary';

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: true
});

// Log the configuration
console.log(cloudinary.config())

const uploadFile = async (FilePath) => {

    if(!FilePath) return null;

    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: "auto"
    };

    try {
      // Upload the image
      const result = await cloudinary.uploader.upload(FilePath, options);
      console.log(result);
      return result.public_id;
    } catch (error) {
      console.error(error);
    }
};

export { uploadFile};