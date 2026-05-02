import { asyncHandler } from "../utils/asyncHandler";

const userJWT = asyncHandler(async (req, res, next) => {
    req.cookies?.accessToken || req.header("Authorization")
})