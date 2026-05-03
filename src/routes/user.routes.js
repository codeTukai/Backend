import { Router } from "express";
import { userLoggedOut, userLogin, userRegister } from "../controllers/user.controller.js";
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
export default userRouter;