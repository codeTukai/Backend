import dotenv from "dotenv"
dotenv.config({
  path: './.env'
});

import ConnectDB from "./db/index.js";
import { app } from "./app.js";

ConnectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);  
  })
})
.catch((err)=>{
  console.log("DB Connection Failed", err);
})