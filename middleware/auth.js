import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.models.js"


export const VerifyJwt = asyncHandler(async(req, res, next)=>{
  const token = req.cookies?.accessToken  ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
      throw new ApiError(401, "Unauthorized")
  }      
  try {
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id ).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Unauthorized")
        }
        req.user = user;
        next()
        

        
    } catch (error) {
        throw new ApiError(403, "Invalid Token")
    }
})

export const GetLoggedInOrIngnore = asyncHandler(async(req, res, next)=>{
  const token = req.cookies?.accessToken ||
  req.header("Authorization")?.replace("Bearer ", "");
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken").lean()
    req.user= user;
    next()
  } catch (error) {
    console.log("Failed to session")
    next()

  }

})

