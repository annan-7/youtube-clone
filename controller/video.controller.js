import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary_config.js";

import { User } from "../models/user.models.js";
import { videoQuality } from "../models/video-quality.models.js";
import { upload } from "../utils/cloudinaryAllUpload.js";
import fs from "fs"



const createVideo= asyncHandler(async(req, res)=>{
        const {title,description} = req.body;
        const user = req.user._id;

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
            description,
            Owner: user


        })

        await videosUploaded.save()

        

        return res.status(200).json(
            new ApiResponse(200,"Video uploaded successfully", videosUploaded )
        )
        

        
    
})

const getVideos = asyncHandler(async(req, res)=>{
    
    try {
        const id = await Video.findOne({Owner: req.user._id})
        const user = await User.findById(id)
        const videos = await Video.find({})

        return res.status(200).json(
            new ApiResponse(200, "Videos fetched successfully", videos)
        )
    } catch (error) {
        throw new ApiError(500, "Error fetching all videos")
        
    }

    

})

const GetVideoByGenre = asyncHandler(async(req, res)=>{

    const {genre} = req.params;

    try {
        const videos = await Video.find({genre})
        if(!videos){
            throw new ApiError(404, "No video found")
        }
        return res.status(200).json(
            new ApiResponse(200, "Videos fetched successfully", videos))
    } catch (error) {
        throw new ApiError(500, "Error fetching videos by genre")
    }
})

const GetVideoID = asyncHandler(async(req, res)=>{
    const {id} = req.params;

    try {
        const video = await Video.findById(id)
        if(!video){
            throw new ApiError(404, "No video found")
        }
        return res.status(200).json(
            new ApiResponse(200, "Video fetched successfully", video))
    } catch (error) {
        throw new ApiError(500, "Error fetching video details")
    }   
})

const GetAllVideos = asyncHandler(async(req, res)=>{
    
        const videos = await Video.find({})
        if(!videos){
            throw new ApiError(404, "No video found")
        }
        
       
        
        
        
        return res.status(200).json(
            new ApiResponse(200, "Videos fetched successfully", videos))
    
})
const VideoUser = asyncHandler(async(req, res)=>{
    const {id} = req.params;
    if(!id){
        throw new ApiError(400, "User ID is required")
    }
    const user = await User.findById(id).select("-password -__v -createdAt -updatedAt -email -refreshToken -fullname")
    if(!user){
        throw new ApiError(404, "Video not found")
    }
    
    

    res.status(200).json(
        new ApiResponse(200, user, "User fetched from video")
    )
})
const VideoQua = asyncHandler(async(req, res)=>{
    const videolocal = req.files?.['video']?.[0]?.path;
    const thumbnailLocalPath = req.files?.['thumbnail']?.[0]?.path;
    const {title, description} = req.body;
    const user = req.user._id;
    
    try {
        if(!videolocal || !thumbnailLocalPath ){
            throw new ApiError(400, "Please upload your video or Thumbnail ")
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
       
       
       
       const [UploadVideo360, UploadVideo720, UploadVideo1080] = await Promise.all([
        uploadOnCloudinary(videolocal, option360),
        uploadOnCloudinary(videolocal, option720),
        uploadOnCloudinary(videolocal, option1080),
        

       ])
       const UploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
       if(!UploadVideo360 || !UploadVideo720 || !UploadVideo1080 ){
           throw new ApiError(500, "Error uploading video")
       }
       const video = await  videoQuality.create({
        url_360 : UploadVideo360.url,
        url_720 : UploadVideo720.url,
        url_1080 : UploadVideo1080.url,
        thumbnail : UploadThumbnail.url,
        title,
        description,
        Owner:user

       })
       await video.save();

       fs.unlinkSync(videolocal,thumbnailLocalPath)
       
       
       

       
       
       
    
         
        return res.status(200).json(
            new ApiResponse(200, video, "Video uploaded Successfully" )
        )
    } catch (error) {
        console.log(error)
        return res.status(500).json(
            new ApiResponse(500, null, "Error uploading video" )
        )
    }
        
    
    
})

const GetVideoQuality = asyncHandler(async(req, res)=>{
    try {
        const videos = await videoQuality.find({});

    return res.status(200).json(
        new ApiResponse(200, videos, "Fetched Video Quality Successfully")
    )
    } catch (error) {
        return res.status(500).json(
            new ApiResponse(500, null, "Failed to Fetch Video Quality")
        )
    }
    
})
    

/*const VideoQua = asyncHandler(async(req, res)=>{
    const video = req.files?.['video']?.[0]?.path;
    if(!video){
        throw new ApiError(400, "Please upload your video")
    }
    const videoUpload = await upload(video);
    return res.status(200).json(
        new ApiResponse(200, videoUpload, "Video uploaded successfully")
    )
})
*/


export {createVideo, GetVideoID, GetAllVideos, VideoUser, VideoQua, GetVideoQuality};