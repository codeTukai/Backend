import { Router } from "express";
import { getUserTweets, createTweet, deleteTweet} from '../controllers/tweet.controller.js'

const tweetRouter = Router();

tweetRouter.get("/", getUserTweets);
tweetRouter.post("/", createTweet);
tweetRouter.delete("/:tweetId", deleteTweet);

export default tweetRouter;