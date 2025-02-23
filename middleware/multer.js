import multer from "multer"; 
//remove if deos not fix the issue
import { v4 as uuidv4 } from "uuid"; // For unique filenames
import path from "path";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})