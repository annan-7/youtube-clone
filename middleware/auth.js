import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"


export const VerifyToken = asyncHandler(async(req, res, next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token){
            throw new ApiError(401, "Token not found")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()

        return res.status(200).json(
            new ApiResponse(200, decodedToken, "Token Verified Successfully")
        )
    } catch (error) {
        throw new ApiError(401, "Error Ocurred in Verifying the Token")
    }
})

