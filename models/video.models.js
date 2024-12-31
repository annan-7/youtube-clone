
import mongoose, {Schema} from "mongoose";

const videoSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description:{
        type: String,
        required: true,
        maxlength: 500
    },
    VideoUrl:{
        type: String,
        required: true
    },
    ThumbnailUrl:{
        type: String,
        required: true
    }


},{ timestamps: true})

export const Video = mongoose.model("Video", videoSchema)