
import { Playlist } from "../models/playlist.models.js";
import { VideoQuality } from "../models/video-quality.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const createPlaylist = asyncHandler(async(req,res)=>{
   
    const {video} = req.params;
    if(!video){
     throw new ApiError(400, "Video Id is required")
    }
    const PlaylistOwner = await User.findById(req.user?._id)
    
    if(!PlaylistOwner){
     throw new ApiError(404, "User not found")
    }
    
    const {title, description} = req.body;
   
    if(!title ){
     throw new ApiError(400, "Title is required")
    }
    const videoExist = await VideoQuality.findById(video);
    /*
    {
   _id: new ObjectId('69c0602cb60cda04dbc8c6fd'),
   title: 'math edit',
   description: 'math is elegant ',
   url_480: 'https://yt-clone-aws-v1.s3.amazonaws.com/videos/hls/1774215202533-69ad02785086c49d6d3141f4/480p/index.m3u8',
   url_720: 'https://yt-clone-aws-v1.s3.amazonaws.com/videos/hls/1774215202533-69ad02785086c49d6d3141f4/720p/index.m3u8',
   url_1080: 'https://yt-clone-aws-v1.s3.amazonaws.com/videos/hls/1774215202533-69ad02785086c49d6d3141f4/1080p/index.m3u8',
   master_m3u8: 'https://yt-clone-aws-v1.s3.amazonaws.com/videos/hls/1774215202533-69ad02785086c49d6d3141f4/master.m3u8',
   thumbnail: 'https://yt-clone-aws-v1.s3.amazonaws.com/thumbnails/1774215212085-images-1774215067043-db3312a6-28b0-4950-b707-e03db126f042.png',
   Owner: new ObjectId('69ad02785086c49d6d3141f4'),
   likesCount: 1,
   dislikesCount: 1,
   createdAt: 2026-03-22T21:33:32.540Z,
   updatedAt: 2026-03-31T16:45:43.551Z,
   __v: 0
 }
    
    */ 
    if(!videoExist){
     throw new ApiError(404, "Video not found or has been deleted")
    }
    const playlist = await Playlist.create({
     video,
     PlaylistOwner: PlaylistOwner._id,
     VideoOwner: videoExist.Owner,
     title,
     description,
 
    })
    await playlist.save();

    return res.status(200).json(
        new ApiResponse(200,playlist,"Playlist Created Sucessfully ")    )
   
})

const DeletePlaylist= asyncHandler(async(req,res)=>{
    const playlistId = req.params._id;
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required")
    }
    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if(!playlist){
        throw new ApiError(404,'Playlist not found')
    }
    if(playlist){
        return res.status(200).json(
            new ApiResponse(200,playlist,"Playlist Deleted Sucessfully ")
        )
    }

})

const AddVideoToPlaylist = asyncHandler(async(req,res)=>{
   const playlistId = req.params._id;
   const videoId = req.params.video;
   if(!playlistId || !videoId){
    throw new ApiError(400,"Playlist Id and Video Id are required")
   }
   const playlist = await Playlist.findById(playlistId);
   if(!playlist){
    throw new ApiError(404,"Playlist not found")
   }
   const video = await VideoQuality.findById(videoId);

   if(!video){
    throw new ApiError(404,"Video not found")
   }
   playlist.videos.push(videoId);
   await playlist.save();
   return res.status(200).json(
    new ApiResponse(200,playlist,"Video added to playlist Successfully ")
   )

});

const DeleteVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params._id;
    const videoID = req.params.video;
    if(!playlistId || ! videoId){
        throw new ApiError(400,"Playlist Id and Video ID are required")
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist not found")
    }
    const video = await VideoQuality.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    playlist.videos.pull(videoId);
    await playlist.save();
    return res.status(200).json(
        new ApiResponse(200,playlist,"Video removed from playlist Successfully ")
    )


})
const UpdateVideoInPlaylist = asyncHandler(async(req,res)=>{
   const playlistId= req.params._id;
   const videoId = req.params.video;

   if(!playlistId || !videoId){
     throw new ApiError(400,"Playlist Id and Video ID are required")
   }
   const video = await VideoQuality.findById(videoId);
   if(!video){
    throw new ApiError(404, "Video not found")
   }

   const playlist = await Playlist.findById(playlistId);
   if(!playlist){
    throw new ApiError(404,"Playlist not found")
   }
   
   res = await playlist.findOneAndUpdate(playlist,video)
   await playlist.save();

   if(res){
    return res.status(200).json(
        new ApiResponse(200,playlist,"Video has been updated from playlist Successfully ")
    )
   }

    
})


export{createPlaylist, DeletePlaylist, AddVideoToPlaylist, DeleteVideoFromPlaylist, UpdateVideoInPlaylist}