import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessTokenAndRefreshToken = async(userId)=>{
   try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    console.log(accessToken);
    console.log(refreshToken);
    

    user.refreshToken = refreshToken //save into database 
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }

   } catch (error) {
    throw new ApiError(500, "Something went wrong while generating refresh and access token")
   }
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
    

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

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

} )

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

   //create cookies
   const options = {
    httpOnly: true, //only modified by server by httpOnly method
    secure: true
   }
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

const userLoggedOut = await asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
            
        },
        {
           new: true
        }
    )
 const options = {
    httpOnly: true, 
    secure: true
   }

   return res.status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200, {}, "User logged out"))

})



export {
   userRegister,
   userLogin,
   userLoggedOut
}