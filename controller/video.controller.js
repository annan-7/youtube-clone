import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadFile } from "../utils/cloudinary_config.js";


const createVideo= asyncHandler(async(req, res)=>{
    
        const {video, title, thumbnail, description} = await req.body;
    
        if(!video){
            throw new ApiError(400, "Please upload your video")
        }
        const FileUploading = uploadFile(video)
        if(!FileUploading){
            throw new ApiError(500, "Error uploading video in cloudinary")
        }
        const videoURL = FileUploading.url;

        const ThumbnailUploading = uploadFile(thumbnail)
        if(!ThumbnailUploading){
            throw new ApiError(500, "Error uploading thumbnail in cloudinary")
        }

        const ThumbnailUrl = ThumbnailUploading.url;

        const videoUploaded = Video.create({
            VideoUrl : videoURL,
            ThumbnailUrl,
            title,
            description


        })

        const videoCreated = await Video.findById(videoUploaded._id)

        return res.status(200).json(
            new ApiResponse(200,"Video uploaded successfully", videoCreated)
        )
    
})

export {createVideo}