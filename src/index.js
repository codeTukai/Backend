import dotenv from "dotenv"
import ConnectDB from "./db/index.js";



dotenv.config({
  path: './.env'
});


ConnectDB()















/*
import express from "express"
const app = express()

//IIFE
(async ()=>{
    try {
      await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
      app.on("error", (error)=>{
        console.log("ERROR:", error);
        throw error
      })

      app.listen(process.env.PORT, ()=>{
        console.log(`App is running on port: ${process.env.PORT}`);
        
      })
    } catch (error) {
        console.error("ERROR", error);
        throw error
    }
})()
*/