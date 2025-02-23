import mongoose,{Schema} from "mongoose";

const videoQualitySchema = new Schema({
    
    url_360:{
        type: String,
        default:""
    },
   url_720:{
    type: String,
    default:""

   },
   url_1080:{
    type: String,
    default:""
   },
   thumbnail:{
    type: String,
    default:""
   }
},{timestamps:true})

export const videoQuality = mongoose.model("videoQuality", videoQualitySchema)

