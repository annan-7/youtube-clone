import mongoose,{Schema} from "mongoose";
import { Video } from "./video.models.js";
import { User } from "./user.models.js";

const CommentSchema = new Schema({
    content:{
        type: String,
        required: true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref: 'Video'
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }

},{timestamps:true})

export const Comment = mongoose.model('Comment',CommentSchema);