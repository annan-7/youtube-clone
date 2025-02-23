
import {User} from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Passport} from "passport"
import {Strategy} from "passport-google-oauth20"



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

    const createdUser = await User.findById(user._id).select("-password").lean();

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
    
    
    const {
        accessToken, 
        refreshToken,
        
    } = await GenerateAccessandRefreshTokens(user._id);


    const LoggedInUser = await User.findOne({email}).select("-password -refreshToken").lean();

    const options ={
        httpOnly: true,
        
    }
    return res.status(200).cookie("accessToken",accessToken,options)
    .cookie("refreshToken", refreshToken,options)
    .json(
        new ApiResponse(200, {
            user: LoggedInUser, accessToken , refreshToken
        },
        "User logged in successfully"
    )
    )

    

    
})

const LogOut = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new:true
        }
    )

    const options ={
        httpOnly: true,
        secure: false //change to true in production
    }
    return res.status(200)
    .clearCookie("accessToken", accessToken, options)
    .clearCookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(200,{}, "User Logged OUT successfully")
    )
})

const Session = asyncHandler(async (req, res) => {
    // Return the user information from the request
    
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isAuthenticated: true,
          user: req.user?._id
        },
        "Session verified successfully"
      )
    );
});
const NoSession = asyncHandler(async (req, res) => {
    // Return an empty user object
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          isAuthenticated: false,
          user: null
        },
        "No session found"
      )
    );
});
const profile = asyncHandler(async(req, res)=>{
    const user = req.user;
    
    
    return res.status(200).json(
        new ApiResponse(200, user, "User profile fetched successfully")
    )
})

export {registerUser, loginUser, GenerateAccessandRefreshTokens, LogOut, Session, NoSession,profile}