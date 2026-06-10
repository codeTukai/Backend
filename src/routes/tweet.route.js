import { Router } from "express";

const tweetRouter = Router();

tweetRouter.get("/", getTweets);
tweetRouter.post("/", createTweet);
tweetRouter.delete("/:tweetId", deleteTweet);

export default tweetRouter;