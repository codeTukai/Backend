import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const ConnectDB = async () => {
    try {
        const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB HOST`);
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1)
    }
}

export default ConnectDB