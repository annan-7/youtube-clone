import mongoose,{Schema} from "mongoose";
import { Video } from "./video.models.js";
import { User } from "./user.models.js";
import { Comment } from "./comments.models.js";


const LikeSchema = new Schema({
  video:{
    type: Schema.Types.ObjectId,
    ref:"Video",
    default:null
  },
  user:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
    
  },
  commentId:{
    type:Schema.Types.ObjectId,
    ref:"Comment",
    default:null
  },

},{timestamps:true});



export const Like = mongoose.model('Like',LikeSchema);