import mongoose from "mongoose";
import {User} from "../models/user.models.js"
import { Video } from "../models/video.models.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getVideo = asyncHandler(async(req,res)=>{

})

export {
    getVideo
}