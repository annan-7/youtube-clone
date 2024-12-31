import {json} from "express";
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";


const GenerateAccessandRefreshTokens= async(userid)=>{
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
    
        user.refreshToken = refreshToken;
    
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

        
    } catch (error) {
        throw new ApiError(500, "Token generation failed")
    }



}

const registerUser = asyncHandler(async(req, res)=>{
    console.log("Data received", req.body)
    const {fullname,username, email , password} = req.body;

    //checking
    

    
    if([username, fullname, email, password].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        email
    })
    if(existedUser){
        throw new ApiError(400, "User already exists")
    }

    const user = await User.create({
        username,
        fullname,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select("-password")

    return res.status(200).json(
       new ApiResponse(200,"USER CREATED SUCCESSFULLY", createdUser)
        
    )



})


const loginUser = asyncHandler(async(req ,res )=>{
    const {email, password}= req.body;
    
    if([email, password].some((field)=> field.trim()==="")){
        throw new ApiError(400, "All fields are required")
    }    
    const user = await User.findOne({email})
    
    if(!user){
        throw new ApiError(400, "User not found")
    }

    const IsPasswordValid = await user.isPasswordCorrect(password);

    if(!IsPasswordValid){
        throw new ApiError(400, " Invalid password")
    }
    
    
    const {accessToken, refreshToken} = await GenerateAccessandRefreshTokens(user._id);


    const LoggedInUser = await User.findOne({email}).select("-password -refreshToken")

    const options ={
        httpOnly: true,
        secure: true
    }
    return res.status(200).cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(200,{user: LoggedInUser, accessToken , refreshToken}, "User logged in successfully")
    )


    
})

const LogOut = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(200,{}, "User Logged OUT successfully")
    )
})

export {registerUser, loginUser, GenerateAccessandRefreshTokens, LogOut}