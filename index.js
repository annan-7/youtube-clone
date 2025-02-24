import express from "express"
import {registerUser, loginUser, LogOut, Session, NoSession, profile} from "./controller/user.controller.js"
import connectDB from "./Db/db_connection.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";
import { VerifyJwt, GetLoggedInOrIngnore } from "./middleware/auth.js";
import { createVideo,GetAllVideos,GetVideoID, VideoUser,VideoQua , GetVideoQuality} from "./controller/video.controller.js";
import { createComment,
    getComments

 } from "./controller/comment.controller.js";

import { upload } from "./middleware/multer.js";
import { likeDislikeVideo, likeDislikeComment, likeDislikeVideoStatus } from "./controller/like.controller.js";
import authMiddleware from "./middleware/authication_try.js";
dotenv.config({ path:'.env' });

const app = express()
const port = process.env.PORT

dotenv.config({ path:'./env' });

app.use(cors({
    origin: process.env.CORS_ORIGEN,
    credentials: true
}) )

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

connectDB().then(()=>{
    app.listen(port, ()=>{
        console.log(`server at http://localhost:${port}`)
    })
})
.catch((err)=> console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use((err, req, res, next) => {
    console.error('Global Error:', err);
    res.status(err.statusCode || 500).json({
      error: err.message || 'Internal Server Error'
    });
  });

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/api', (req, res) => {
    console.log(process.env.PORT)
})


app.route('/api/register').post(registerUser)

app.route('/api/login').post(loginUser)

app.route('/api/logout').delete(LogOut)

app.route('/api/upload').post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount:1
        }
    ]),VerifyJwt,
    createVideo)

app.route('/api/:video/comment').post(createComment)  

app.route('/api/:video/getcomment').get(getComments)

app.route('/api/allvideos').get(GetAllVideos)

app.route('/api/videos/:id').get(GetVideoID)
app.route('/api/:id/user').get(VideoUser)

app.route('/api/:videoId/reaction').post(VerifyJwt, likeDislikeVideo)

app.route('/api/:videoId/reaction/status').get(VerifyJwt,likeDislikeVideoStatus)

app.route('/api/auth/session').get(GetLoggedInOrIngnore, Session)

app.route('/api/auth/nosession').get(NoSession)

app.route('/api/profile').get(VerifyJwt, profile)

app.route('/api/videoQuality').post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },{
            name: "thumbnail",
            maxCount: 1
        }
    ]),VideoQua    
)
app.route('/api/get-video-quality').get(GetVideoQuality)



