import dotenv from "dotenv"
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: './.env'
});


ConnectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
    
//  
//     app.on("error", (error)=>{
//         console.log("ERROR:", error);
//         throw error
//       })

//  

  })
})
.catch((err)=>{
  console.log("DB Connection Failed", err);
})
















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