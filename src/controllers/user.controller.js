import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const userRegister = asyncHandler(async(req,res)=>{
   const {username, email, password, fullName} = req.body

   if ([ username, fullName, email, password ].some((fields)=> fields?.trim() === "")) 
      
   {
      throw new ApiError(404, "All Fields are Required")
   }

   const existedUser = await User.findOne({
      $or: [{ email },{ username }]
   })
   
   if(existedUser){
      throw new ApiError(409, "User with email or username already exists")
   }

   const avatarLocalPath = req.files?.avatar?.[0]?.path;
   console.log(avatarLocalPath);
   
   const coverImageLocalPath =  req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
   throw new ApiError(400, "Avatar is required")
  }
   
  const avatar = await uploadOnCloudinary(avatarLocalPath)
  console.log(avatar);
  
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)
  console.log(coverImage);
  

   if (!avatar) {
   throw new ApiError(401, "Avatar is required")
  }

 const user = await User.create({
   fullName,
   avatar: avatar.url,
   coverImage: coverImage?.url || "",
   email,
   password,
   username: username.toLowerCase()
  })

  console.log(user);
  

  const createdUser = await User.findById(user._id).select(
   "-password -refreshToken"
  )
  if (!createdUser) {
   throw new ApiError(500, "Something went wrong while registering the user")
  }

  return res.status(201).json(
   new ApiResponse(200, createdUser, "User registered successfully")
  )
})




export {
   userRegister,
}