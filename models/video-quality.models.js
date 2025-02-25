import mongoose,{Schema} from "mongoose";

const videoQualitySchema = new Schema({
    title:{
        type: String,
        required:true
    },
    description:{
        type: String,
        default:""
    },
    url_360:{
        type: String,
        default:""
    },
   url_720:{
    type: String,
    required: true

   },
   url_1080:{
    type: String,
    default:""
   },
   thumbnail:{
    type: String,
    default:""
   },
   Owner:{
    type: Schema.Types.ObjectId,
    ref:"User"
   }
},{timestamps:true})

export const videoQuality = mongoose.model("videoQuality", videoQualitySchema)

