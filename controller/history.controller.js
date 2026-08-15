import WatchHistory from "../models/watch-history.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.models.js";

import { Comment } from "../models/comments.models.js";
import { Video} from "../models/video.models.js";

const watchHistoryController = asyncHandler(async(req,res)=>{
    const {videoId} = req.body;
    const {userId} = req.userId;
    const video = await Video.findById(videoId);

    if(!videoId && !userId){
        throw new ApiError(400, "VideoId and IuserId are required")
    }

    if(!video){
        throw new ApiError(404, "Video not Found")
    }
    const watchHistory = await WatchHistory.create({
        userId,
        videoId
    });
    
    return res.status(201).json(
        new ApiResponse(201, "Video Has been official been added to your watch history", watchHistory)
    )
});

const DeleteWatchHistory = asyncHnadler(async(req,res)=>{
    const {videoId} = req.body;
    const {userId} = req.userId;
    const video = await Video.findById(videoId);

    if(!videoId && !userId){
        throw new ApiError(400, "VideoId and IuserId are required")
    }

    if(!video){
        throw new ApiError(404, "Video not Found")
    }

    const DeleteHistory = await WatchHistory.findOneAndDeleteById({
        userId,
        videoId
    });
})

export default {watchHistoryController, DeleteWatchHistory};