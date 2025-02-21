import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.models.js";

import { Comment } from "../models/comments.models.js";
import { Video} from "../models/video.models.js";


const likeDislikeVideo = asyncHandler(async(req, res)=>{
  const {videoId} = req.params;
  const likedBy = req.user?._id;
  if (!likedBy) {
    throw new ApiError(401, "Unauthorized: User not authenticated");
  }
  console.log("info",likedBy, videoId)
  //So i am getting the videoId from the params and the likedBy from the middleware 

  const video = await Video.findById(videoId);
  

  if(!video){
    throw new ApiError(404, "Video not found or has been deleted")
  }
  const alreadyLiked = await Like.findOne({
    video:videoId,
    user:likedBy
  })
  if (alreadyLiked){
    await Like.findOneAndDelete({
      video:videoId,
      user:likedBy
    })
    return res.status(200).json(
      new ApiResponse(200, { isliked: false}, "Video unliked successfully")
    )
  }else{
    const like = await Like.create({
      video:videoId,
      user:likedBy
    })
    if(!like){
      throw new ApiError(500, "Failed to like video")
    }
    

    return res.status(200).json(
      new ApiResponse(200, {isliked: true , }, "Video liked successfully")
    )
  }

})
const likeDislikeVideoStatus = asyncHandler(async(req, res)=>{
  try {
    const {videoId} = req.params;
    const userId = req.user._id; // From authentication middleware
    
    // Check if user has liked the video
    const existingReaction = await Like.findOne({
      video: videoId,
      user: userId
    }).lean();

    // Get total likes count
    const likeCount = await Like.countDocuments({video: videoId}).lean();
    const isLiked = !!existingReaction;

    res.status(200).json(
      new ApiResponse(200,{isLiked,likeCount},"Like status retrieved"
   ));

  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, "Failed to retrieve like status")
    );
  }

})
const likeDislikeComment = asyncHandler(async(req, res)=>{
  const {commentId} = req.params;

  const comment = await Comment.findById(commentId);

  if(!comment){
    throw new ApiError(404, "Comment not found or has been deleted")
  }
  const alreadyLiked = await Like.findOne({
    commentId,
    likedBy : req.user?._id
  })
  if (alreadyLiked){
    await Like.findOneAndDelete({
      commentId,
      likedBy: req.user?._id
    })
    return res.status(200).json(
      new ApiResponse(200, { isliked: false}, "Comment unliked successfully")
    )
  }else{
    const like = await Like.create({
      commentId,
      likedBy: req.user?._id
    })
    return res.status(200).json(
      new ApiResponse(200, {isliked: true}, "Comment liked successfully")
    )
  }

})

export {
    likeDislikeVideo,
    likeDislikeVideoStatus,
    likeDislikeComment
}