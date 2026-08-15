import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/likes.models.js";

import { Comment } from "../models/comments.models.js";
import { Video} from "../models/video.models.js";

import { VideoQuality } from "../models/video-quality.models.js";


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



const AddReaction = asyncHandler(async(req, res)=>{
 
  

 
    try {
      const {videoId} = req.params;
      const {type} = req.body;
      const User = req.user._id;
  
      console.log("data received",{ User, videoId, type })
    
      const REACTION_TYPES = {
      LIKE: 'like',
      DISLIKE: 'dislike'
    }
    
    
        if(!Object.values(REACTION_TYPES).includes(type)){
        return new ApiResponse(400, null, "Invalid reaction type")
      }
    
    
      if(!videoId){
        throw new ApiError(400,"Video ID is required")
      }
      if(!User){
        throw new ApiError(401,"Unauthorized: User not authenticated")
      }
      const video = await VideoQuality.findById(  videoId  );
      if(!video){
        throw new  ApiError(404,"Video not found or has been deleted")
      }
      const alreadyReacted = await Like.findOne({ video: videoId, user: User })
      console.log("alreadyReacted", alreadyReacted);
      
      if(!alreadyReacted){
        await Like.create({video: videoId, user: User, type })
    
    
        if (type === REACTION_TYPES.LIKE) {
          await VideoQuality.findByIdAndUpdate( videoId , { $inc: { likesCount: 1 } });
          console.log("Like added, likesCount incremented");
        } else {
          await VideoQuality.findByIdAndUpdate( videoId , { $inc: { dislikesCount: 1 } });
          console.log("Dislike added, dislikesCount incremented");
        }
        return new ApiResponse(200, { isLiked: type === REACTION_TYPES.LIKE }, "Reaction added successfully")
        
      }
      if(alreadyReacted.type === type){
        await alreadyReacted.deleteOne();
        if (type === REACTION_TYPES.LIKE) {
          await VideoQuality.findByIdAndUpdate( videoId , { $inc: { likesCount: -1 } });
          console.log("Like removed, likesCount decremented");
        } else {
          await VideoQuality.findByIdAndUpdate( videoId , { $inc: { dislikesCount: -1 } });
          console.log("Dislike removed, dislikesCount decremented");
        }
        return new ApiResponse(200, { isLiked: false }, "Reaction removed successfully")
      }
    
      const oldType = alreadyReacted.type;
      alreadyReacted.type = type;
      await alreadyReacted.save();
    
      const updateFields = {};
    
      if (oldType === REACTION_TYPES.LIKE) {
        updateFields.likesCount = -1
        updateFields.dislikesCount = 1
      }else{
        updateFields.likesCount = 1
        updateFields.dislikesCount = -1
      }
      await VideoQuality.findByIdAndUpdate( videoId , { $inc: updateFields });
    
      return res.status(200).json(
              new ApiResponse(200,{isLiked: type === REACTION_TYPES.LIKE},"Reaction updated successfully")    
      )
    } catch (error) {
     return new ApiResponse(400, null, "Invalid reaction type")
    }
  

  
    
  
  

})

const AddReaction2 = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { type } = req.body;
  const userId = req.user._id;

  const REACTION_TYPES = {
    LIKE: 'like',
    DISLIKE: 'dislike'
  };

  if (!Object.values(REACTION_TYPES).includes(type)) {
    return res.status(400).json(
      new ApiResponse(400, null, "Invalid reaction type")
    );
  }

  const video = await VideoQuality.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const alreadyReacted = await Like.findOne({ video: videoId, user: userId });

  // ====================
  // CREATE
  // ====================
  if (!alreadyReacted) {
    await Like.create({ video: videoId, user: userId, type });

    const field = type === REACTION_TYPES.LIKE ? "likesCount" : "dislikesCount";

    await VideoQuality.findByIdAndUpdate(videoId, {
      $inc: { [field]: 1 }
    });

    return res.status(200).json(
      new ApiResponse(200, { isLiked: type === REACTION_TYPES.LIKE }, "Reaction added")
    );
  }

  // ====================
  // TOGGLE OFF
  // ====================
  if (alreadyReacted.type === type) {
    await alreadyReacted.deleteOne();

    const field = type === REACTION_TYPES.LIKE ? "likesCount" : "dislikesCount";

    await VideoQuality.findByIdAndUpdate(videoId, {
      $inc: { [field]: -1 }
    });

    return res.status(200).json(
      new ApiResponse(200, { isLiked: false }, "Reaction removed")
    );
  }

  // ====================
  // SWITCH
  // ====================
  const oldType = alreadyReacted.type;

  alreadyReacted.type = type;
  await alreadyReacted.save();

  const updateFields = {};

  if (oldType === REACTION_TYPES.LIKE) {
    updateFields.likesCount = -1;
    updateFields.dislikesCount = 1;
  } else {
    updateFields.likesCount = 1;
    updateFields.dislikesCount = -1;
  }

  await VideoQuality.findByIdAndUpdate(videoId, {
    $inc: updateFields
  });

  return res.status(200).json(
    new ApiResponse(200, { isLiked: type === REACTION_TYPES.LIKE }, "Reaction updated")
  );
});

const AddReactionComment= asyncHandler(async(req,res)=>{

  const REACTION_TYPES = {
    LIKE: 'like',
    DISLIKE: 'dislike'
  };

  const user = req.user._id;

  if(!user){
    return res.status(401).json(
      new ApiResponse(401, null, "Login to react")
    )
  }

  const {comment} = req.params;
  if(!comment ){
    return res.status(400).json(
      new ApiResponse(400, null, "Error fetching comment id")
    )
  }

  const {type} = req.body;
  if(!Object.values(REACTION_TYPES).includes(type)){
    return res.status(400).json(
      new ApiResponse(400, null, "Reaction type must be like or dislike")
    )
  }

  const commentDoc = await Comment.findById(comment);
  if (!commentDoc) {
    return res.status(404).json(
      new ApiResponse(404, null, "Comment not found")
    )
  }

  const AlreadyReacted = await Like.findOne({user, comment})

   // ====================
  // CREATE
  // ====================
  if (!AlreadyReacted) {
    await Like.create({ comment, user, type });

    const field = type === REACTION_TYPES.LIKE ? "likeCount" : "dislikeCount";

    await Comment.findByIdAndUpdate(comment, {
      $inc: { [field]: 1 }
    });

    return res.status(200).json(
      new ApiResponse(200, {
        isLiked: type === REACTION_TYPES.LIKE,
        likeCount: Math.max(0, commentDoc.likeCount + (type === REACTION_TYPES.LIKE ? 1 : 0)),
        dislikeCount: Math.max(0, commentDoc.dislikeCount + (type === REACTION_TYPES.DISLIKE ? 1 : 0))
      }, "Reaction added")
    );
  }

  // ====================
  // TOGGLE OFF
  // ====================
  if (AlreadyReacted.type === type) {
    await AlreadyReacted.deleteOne();

    const field = type === REACTION_TYPES.LIKE ? "likeCount" : "dislikeCount";

    await Comment.findByIdAndUpdate(comment, {
      $inc: { [field]: -1 }
    });

    return res.status(200).json(
      new ApiResponse(200, {
        isLiked: false,
        likeCount: Math.max(0, commentDoc.likeCount + (type === REACTION_TYPES.LIKE ? -1 : 0)),
        dislikeCount: Math.max(0, commentDoc.dislikeCount + (type === REACTION_TYPES.DISLIKE ? -1 : 0))
      }, "Reaction removed")
    );
  }

  // ====================
  // SWITCH
  // ====================
  const oldType = AlreadyReacted.type;

  AlreadyReacted.type = type;
  await AlreadyReacted.save();

  const updateFields = {};

  if (oldType === REACTION_TYPES.LIKE) {
    updateFields.likeCount = -1;
    updateFields.dislikeCount = 1;
  } else {
    updateFields.likeCount = 1;
    updateFields.dislikeCount = -1;
  }

  await Comment.findByIdAndUpdate(comment, {
    $inc: updateFields
  });

  const nextLikeCount = commentDoc.likeCount + (updateFields.likeCount || 0);
  const nextDislikeCount = commentDoc.dislikeCount + (updateFields.dislikeCount || 0);

  return res.status(200).json(
    new ApiResponse(200, {
      isLiked: type === REACTION_TYPES.LIKE,
      likeCount: Math.max(0, nextLikeCount),
      dislikeCount: Math.max(0, nextDislikeCount)
    }, "Reaction updated")
  );
})

export {
    likeDislikeVideo,
    likeDislikeVideoStatus,
    likeDislikeComment,
    AddReaction,
    AddReaction2,
    AddReactionComment
}