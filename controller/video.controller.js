import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary_config.js";


const createVideo= asyncHandler(async(req, res)=>{
        const {title,description} = req.body;

        const videoLocalPath = req.files?.['video']?.[0]?.path;
        const thumbnailLocalPath = req.files?.['thumbnail']?.[0]?.path;
    
        if(!videoLocalPath || !thumbnailLocalPath){
            throw new ApiError(400, "Please upload your video or thumbnail")
        }
        const FileUploading = await uploadOnCloudinary(videoLocalPath)
        if(!FileUploading){
            throw new ApiError(500, "Error uploading video in cloudinary")
        }
        ;

        const ThumbnailUploading = await uploadOnCloudinary(thumbnailLocalPath)
        if(!ThumbnailUploading){
            throw new ApiError(500, "Error uploading thumbnail in cloudinary")
        }

       

        const videosUploaded = await Video.create({
            VideoUrl : FileUploading.url,
            ThumbnailUrl : ThumbnailUploading.url,
            title,
            description


        })

        await videosUploaded.save()

        

        return res.status(200).json(
            new ApiResponse(200,"Video uploaded successfully", videosUploaded )
        )
        

        
    
})

export {createVideo}