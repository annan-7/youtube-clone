import express from "express"
import {registerUser, loginUser, LogOut} from "./controller/user.controller.js"
import connectDB from "./Db/db_connection.js"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { DB_NAME } from "./constants.js";
import { VerifyToken } from "./middleware/auth.js";
import { createVideo } from "./controller/video.controller.js";


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

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.get('/api', (req, res) => {
    console.log(process.env.PORT)
})
app.get('/api/jokes', (req, res) => {
    const jokesapi = [
        {
            id: 1,
            question: "What did one pirate say to the other when he beat him at chess?",
            answer: "Checkmatey"
        },
        {
            id: 2,
            question: "Why did I quit my job at the coffee shop the other day?",
            answer: "It was just the same old grind over and over."
        },
        {
            id: 3,
            question: "Why should you never buy anything that has Velcro with it?",
            answer: "It's a total rip-off."
        },
        {
            id: 4,
            question: "What is the most groundbreaking invention of all time?",
            answer: "The shovel."
        },
        {
            id: 5,
            question: "Did you hear about the famous Italian chef that recently died?",
            answer: "He pasta way."
        }
    ]    

    res.send(jokesapi)
})

app.route('/api/register').post(registerUser)

app.route('/api/login').post(loginUser)

app.route('/api/logout').get(LogOut, VerifyToken)

app.route('/api/upload').post(createVideo)





