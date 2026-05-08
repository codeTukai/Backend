import mongoose, {Schema, Types} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt'

const userSchema = new Schema(
    {
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
       
    },
    avatar: {
        type: String,
        required: true,

    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
            type:Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required'],
       
    },
    refreshToken: {
        type: String
    }

},{timestamps: true})

//revised

userSchema.pre("save", async function(){

    if(!this.isModified("password")) return;
        
        this.password = await bcrypt.hash(this.password, 10) //if password modifies or change
        
        
    
})

//re
userSchema.methods.isCorrectPassword = async function(password){
   return await bcrypt.compare(password, this.password)
}

//re
userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username: this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


//re
 userSchema.methods.generateRefreshToken = function(){
   return jwt.sign(
        {
            _id : this._id,
           
        },
        process.env.REFRESH_TOKEN_SECRET,
        
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}





export const User = mongoose.model("User", userSchema)