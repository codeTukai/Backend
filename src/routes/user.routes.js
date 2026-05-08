import { Router } from "express";
import { getCurrentUser, getUserChannelProfile, getWatchHistory, refreshAccessToken, updateCoverImage, updatePassword, updateUserAccount, updateUserAvatar, userLoggedOut, userLogin, userRegister } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const userRouter = Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userRegister
)
userRouter.route("/login").post(userLogin)
userRouter.route("/logout").post(verifyJWT, userLoggedOut)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT, updatePassword)
userRouter.route("/current-user").post(verifyJWT, getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT, updateUserAccount)
userRouter.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
userRouter.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"),updateCoverImage)
userRouter.route("/c/:username").get(getUserChannelProfile)
userRouter.route("/history").get(verifyJWT, getWatchHistory)
export default userRouter;
