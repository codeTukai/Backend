import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const filter = {};

  //search based on title and description
  if (query) {
    filter.$or = [
      {
        title: {
          $regex: query,
          $options: "i",
        },
      },
      {
        description: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  if (userId) {
    filter.owner = userId;
  }

  //sorting based on asc

  const sortOptions = {};

  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  //pagination

  const skip = (page - 1) * limit;

  //fetch videos

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(limit));

  const totalVideoCount = await Video.countDocuments(filter);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          videos,
          totalVideoCount,
          currentPage: Number(page),
          totalPages: Math.ceil(totalVideos / limit),
        },
        "Videos fetch successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video  

 
  
});

export { 
    getAllVideos,
    publishAVideo

 };
