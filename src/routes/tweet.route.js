import { Router } from "express";
import { getUserTweets, createTweet, deleteTweet} from '../controllers/tweet.controller.js'

const tweetRouter = Router();

tweetRouter.get("/getTweet", getUserTweets);
tweetRouter.post("/create", createTweet);
tweetRouter.delete("/:tweetId", deleteTweet);

export default tweetRouter;