import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthCheckUp = asyncHandler(async (req, res) => {
    //TODO: build a healthCheckUp response that simply returns the OK status as json with a message
})

export {
    healthCheckUp
    }
    