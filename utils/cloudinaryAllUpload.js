import {uploadOnCloudinary } from '../utils/cloudinary_config.js';
import { asyncHandler } from './asyncHandler.js';
import fs from 'fs';
import { videoQuality } from '../models/video-quality.models.js';
import { ApiError } from './ApiError.js';

export const upload = async(videoPath)=>{
    
   try {
    if(!videoPath){
        throw new ApiError(400,"Please upload a video")
    }
    const option360= {
        transformation: [
           { width: 640, height: 360, crop: "scale" }, 
           { quality: "auto" },
           { bit_rate: "500k" }, 
           { format: "mp4", video_codec: "h264" } 
       ]
   }
   
   const option720 = {
       transformation: [
           { width: 1280, height: 720, crop: "scale" }, 
           { quality: "auto" },
           { bit_rate: "1500k" }, 
           { format: "mp4", video_codec: "h264" }
       ]
   }
   
   const option1080 = {
       transformation: [
           { width: 1920, height: 1080, crop: "scale" }, 
           { quality: "auto" }, 
           { bit_rate: "3000k" }, 
           { format: "mp4", video_codec: "h264" }
         ]
   }

   const UploadVideo360 = await uploadOnCloudinary(videoPath, option360);
   const UploadVideo720 = await uploadOnCloudinary(videoPath, option720);
   const UploadVideo1080 = await uploadOnCloudinary(videoPath, option1080);

   

   console.log("test from my side",UploadVideo360.url)


   return {Video};
   } catch (error) {
      
        throw new ApiError(500, "Error uploading video")
   }
}