import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

//import express from "express";

dotenv.config({ path:'./env' });
 
//const app = express();
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGOOSE_URI}/${DB_NAME}`)

        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
    }
}


export default connectDB