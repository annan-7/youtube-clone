import mongoose,{Schema} from "mongoose";
import { User } from "./user.models.js";
import { Video } from "./video.models.js";
import { Comment } from "./comments.models";

const LikeSchema = new Schema({
  comment:{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  video:{
    type: Schema.Types.ObjectId,
    ref: 'Video'
  },
  likedBy:{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }

},{timestamps:true});

export const Like = mongoose.model('Like',LikeSchema);