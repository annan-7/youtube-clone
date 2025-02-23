// Require the cloudinary library
import fs from 'fs';
import {v2 as cloudinary} from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path:'.env' });

// Return "https" URLs by setting secure: true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});



const uploadOnCloudinary = async (FilePath,options = {}) => {
    
    try {
      if(!FilePath) return null;
      // Upload the image
      const result = await cloudinary.uploader.upload(FilePath,{
        resource_type: "auto",
        ...options
      });
      
      
      

      return result;
      

    } catch (error) {
      
      console.log(error);
      return null;
    }
};

export { uploadOnCloudinary};