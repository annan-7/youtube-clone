import express from "express"
import {registerUser, loginUser, LogOut, Session, NoSession, profile,serverhealth,DeleteUser } from "./controller/user.controller.js"
import connectDB from "./Db/db_connection.js"
import cors from "cors"
import cookieParser from "cookie-parser";

import { VerifyJwt, GetLoggedInOrIngnore } from "./middleware/auth.js";
import { createVideo,GetAllVideos,GetVideoID, VideoUser,UploadVideoByQuality , GetVideoQuality, GetVideoQualityById} from "./controller/video.controller.js";
import { createComment, getComments } from "./controller/comment.controller.js";

import { upload } from "./middleware/multer.js";
import { likeDislikeVideo, likeDislikeVideoStatus,AddReaction2,AddReactionComment} from "./controller/like.controller.js";
import {createPlaylist} from './controller/playlist.controller.js'
import {watchHistoryController} from './controller/history.controller.js'
const app = express()

import dotenv from "dotenv";
dotenv.config();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
}) )

app.use(express.json())
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

const port = process.env.PORT ;

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
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.use((req,res,next)=>{
    console.log("incoming request ", req.method, req.url)
    next()
})

app.route('/api/health').get(serverhealth)
app.route('/api/register').post(registerUser)
app.route('/api/login').post(loginUser)
app.route('/api/logout').delete(LogOut)
app.route('/api/del').delete(VerifyJwt, DeleteUser)

app.route('/api/serverhealth').get(serverhealth);

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
    ]),
    VerifyJwt,
    createVideo
)
//Comment routes
app.route('/api/:video/comment').post(createComment)
app.route('/api/:video/getcomment').get(getComments)
//Video routes
app.route('/api/allvideos').get(GetAllVideos)
app.route('/api/videos/:id').get(GetVideoID)
app.route('/api/:id/user').get(VideoUser)
//Reaction routes
app.route('/api/:videoId/reaction').post(VerifyJwt, AddReaction2)
app.route('/api/:comment/reactionComment').post(VerifyJwt, AddReactionComment)
app.route('/api/:videoId/reaction/status').get(VerifyJwt,likeDislikeVideoStatus)
//Auth routes
app.route('/api/auth/session').get(GetLoggedInOrIngnore, Session)
app.route('/api/auth/nosession').get(NoSession)
app.route('/api/profile').get(VerifyJwt, profile)

//Playlist routes

app.route('/api/:video/create_playlist').post(VerifyJwt, createPlaylist) //Creates a playlist 
//app.route('/api/:playlistId/addvideo/:videoId').post(VerifyJwt, AddVideoToPlaylist) //ADD VIDEO TO PLAYLIST
//app.route('/api/:playlistId/removevideo/:videoId').delete(VerifyJwt, DeleteVideoFromPlaylist)


//HSitory routes 

app.route('/api/watchhistory').post(VerifyJwt, watchHistoryController) //Creates a playlist
app.route('/api/UploadvideoQuality').post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    VerifyJwt,
    UploadVideoByQuality
)

app.route('/api/video-quality/:id').get(GetVideoQualityById)
app.route('/api/get-video-quality').get(GetVideoQuality)

export default app;
