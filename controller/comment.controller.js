import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { Mongoose } from "mongoose";
import { Video } from "../models/video.models.js";
import { VideoQuality } from "../models/video-quality.models.js";

const createComment = asyncHandler(async(req, res)=>{
    const {content} = req.body;
    const {video} = req.params;
    

    if(!content){
        throw new ApiError(400, "Please enter your comment")
    };
    const videoExist = await VideoQuality.findById(video)
    console.log(videoExist)

    if(!videoExist){
        throw new ApiError(404, "Video not found or has been deleted")
    }
   const user = await Comment.create({
       content,
       video: video,
       owner: req.user?._id,

   }) 
   user.save();

   return res.status(200).json(
    new ApiResponse(200, "Comment added successfully", user)
   )


});

const getComments = asyncHandler(async(req, res)=>{
    const {video} = req.params;
    const { page = 1 , limit = 10} = req.query;

    const comments = await Comment.find({video: video})
    .populate({"path": "owner", select: "username"})
    .sort({createdAt: -1})
    .limit(limit * 1)
    .skip((page - 1) * limit)
    

   
    return res.status(200).json(
        new ApiResponse(200, "Comments fetched successfully", comments)
    )
})
const deleteComment = asyncHandler(async(req,res )=>{
    const {commentId}= req.params;

    if(!commentId){
        return new ApiResponse(400, " Comment Id is required")
    }
    
    const DeleteComment = await Comment.findByIdAndDelete(commentId)

    if(!DeleteComment){
        return new ApiResponse(404, "Comment not found or has been deleted")
    }
     
    return res.status(200).json(
        new ApiResponse(200, {},"Comment has been deleted successfully")
    )
})

const ChangeComment = asyncHandler(async(req,res)=>{
    const {commentID} = req.params;
    const {content} = req.body;

    if(!commentID){
        throw new ApiError(400,'Comment ID is not available or has been deleted')
    }
    if(!content){
        throw new ApiError(400, "Please enter your comment")
    }
})
export {
    createComment,
    getComments,
    deleteComment

}