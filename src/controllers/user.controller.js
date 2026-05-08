import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'

//generate refresh token and access token
const generateAccessTokenAndRefreshToken = async(userId)=>{
   try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    // console.log(accessToken);
    // console.log(refreshToken);
    

    user.refreshToken = refreshToken //save into database 
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

   } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }
}

 //create cookies
   const options = {
    httpOnly: true, //only modified by server by httpOnly method
    secure: true
   }

const userRegister = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);
    // console.log("fullname: ", fullName);
    console.log("password", password);
    
    

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(avatarLocalPath);
    
    

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    console.log(coverImageLocalPath);
    
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    // console.log(avatar);
    
    
    if (!avatar) {
        throw new ApiError(500, "Avatar file is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
   

    const user = await User.create({
        fullName,
        avatar: avatar.secure_url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    // console.log(user)
    

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )//remove the password and refresh token from user response

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const userLogin = asyncHandler( async (req, res) => {
    // existence of user ==> if exist then next step with login --> otherwise sign up
    //userId, userPassword ==> if match --> generate-- accessToken, refreshToken
    //otherwise forgot password
    //last step cookies

    const {email, username, password} = req.body

    if((!email && !username)){
        throw new ApiError(400, "email or username is required")
    }

    const user = await User.findOne({
         $or: [{email},{username}]
         
        })

    if(!user){

        throw new ApiError(404, "user not found")
    }

    const checkValidPassword = await user.isCorrectPassword(password)

    if(!checkValidPassword){
        throw new ApiError(401, "Invalid user credentials")
    }
   
   const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
   console.log(accessToken);
   

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  
// console.log(res);

return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(200,{
        user: loggedInUser, accessToken, refreshToken //optional
    },
    "User logged in successfully"

     )
   )
})

const userLoggedOut =  asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 //this removes the field from document
            }
            
        },
        {
           new: true
        }
    )


   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out"))

})


// check it before debug
const refreshAccessToken = asyncHandler(async(req,res)=>{
    // console.log(req.cookie.refreshToken);
    
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    // console.log(incomingRefreshToken);
    

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized refresh token")
    }

  try {

     const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    //  console.log(decodedRefreshToken);
     
  
     const user = await User.findOne(decodedRefreshToken?._id)
  
     if (!user) {
      throw new ApiResponse(401, "invalid refresh token")
     }
  
     if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh token is expired or used")
     }
  
     const {accessToken,newHoldRefreshToken} = generateAccessTokenAndRefreshToken(user._id)
     res.status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken",newHoldRefreshToken, options)
     .json(
        new ApiResponse(200,
            {accessToken, refreshToken: newHoldRefreshToken},
            "Access token refreshed successfully"
        )
     )
  } catch (error) {
    throw new ApiError(401,error?.message, "unauthorize refresh token")
  }
    
})




const updatePassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)
   const isCorrectPassword = await user.isCorrectPassword(oldPassword)

   if (!isCorrectPassword) {
    throw new ApiError(400, "invalid old password")
   }
    
   user.password = newPassword
   user.save({validateBeforeSave: false})
    
   return res
   .status(200)
   .json(new ApiResponse(200, {}, "password change successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
          .json(new ApiResponse(200, req.user, "get current user"))
          console.log(req.user);
          
})

const updateUserAccount = asyncHandler(async (req,res) => {
    const {fullName , email} = req.body
    if (!fullName || !email) {
        throw new ApiError(401,"all fields are required" )
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
         {
            $set: {
                fullName,
                email
            }
         },
         {new: true}
        ).select("-password")

        return res.status(200)
        .json(new ApiResponse(200, user, "account update successfully"))
  
})

const updateUserAvatar = asyncHandler(async(req,res)=>{
    
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file needed")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
     if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
         {
            $set: {
               avatar:avatar.url
            }
         },
         {new: true}
        ).select("-password")

        return res.status(200).json(new ApiResponse(200, user, "avatar updated successful"))
   
})

//file delete todo

const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
     if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file needed")
    }

     const coverImage = await uploadOnCloudinary(coverImageLocalPath)
     if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, 
        {
            $set:{
                coverImage: coverImage.url
        }
    },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "coverImage updated successfully"))

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params  //user get through url by req.param 

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing")
    }

    const channel = await User.aggregate([  // use aggregate method to create pipeline
        
        {
            $match:{   //match the user 
                username: username?.toLowerCase()
            }, 
        },
        {
            $lookup:{
                from: "subscriptions", //whose are subscribed my channel thats totally
                localField: "_id",
                foreignField: "channel",
                as:"subscribers"
            },
            
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" //whom is subscribed by me 
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelSubscribedCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed:{ //pipeline for is users subscribed or not
                    $cond:{
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                    
                }
            }
        },
       { $project:{  //trigger the field thats needed
                    fullName:1,
                    username:1,
                    channelSubscribedCount: 1,
                    isSubscribed:1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res.status(200)
    .json(new ApiResponse(200, channel[0], "User Channel fetched successfully"))
})

const getWatchHistory = asyncHandler(async(req,res)=>{
    //interview
    // (req.user._id) //---its basically a string format in mongodb and its generate by mongoose/ all are handle by mongoose
    const user = await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            },

        },
        {
            $lookup:{
                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[ //sub-pipeline
                    {
                        $lookup:{
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                         fullName:1,
                                         username:1,
                                         avatar: 1,
                                        
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

 
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, " watch History fetched successfully"))
    
})

export {
   userRegister,
   userLogin,
   userLoggedOut,
   refreshAccessToken,
   updatePassword,
   getCurrentUser,
   updateUserAccount,
   updateUserAvatar,
   updateCoverImage,
   getUserChannelProfile,
   getWatchHistory
}