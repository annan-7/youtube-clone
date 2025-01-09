import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.models.js";
import { Video } from "../models/video.models.js";

const likeVideo = asyncHandler(async(req,res) =>{
    const {video} = req.params;
    const {user} = req.user;
    
    if ( !video){
        throw new ApiError(400, "Comment is required")
        
    }

    const videoExist = await Video.findById(video);
    if(!videoExist){
        throw new ApiError(404, "Video not found or has been deleted")
    }

    const likeExist = await Like.findOne({video, likedBy: user._id});

    if(likeExist){
        await Like.findByIdAndDelete(likeExist._id);
        return res.status(200).json(
            new ApiResponse(200, "Video unliked successfully", null)
        )
    }

    const newlike = await Like.create({
        video,
        likedBy: user._id,
    })


    return res.status(200).json(
        new ApiResponse(200, "Video liked successfully", newlike)
    )

    
})

const likeComment = asyncHandler(async(req,res)=>{
    const {comment} = req.params;
    const {user}= req.user;

    if(!comment){
        throw new ApiError(400, "Comment is required")
    }

    const commentExist = await Comment.findById(comment);
    if (!commentExist){
        throw new ApiError(404, "Comment not found  or has been deleted")
    }

    const likeExist = await Like.findOne({comment, likedBy: user._id});

    if (likeExist){
        await Like.findByIdAndDelete(likeExist._id);
        return res.status(200).json(
            new ApiResponse(200, "Comment unliked successfully", null)
        )
    }

    const newlike = await Like.create({
        comment,
        likedBy: user._id,
    })

    return res.status(200).json(
         new ApiResponse(200,"Comment liked successfully", newlike)
    )

})

export {
    likeVideo,
    likeComment
}