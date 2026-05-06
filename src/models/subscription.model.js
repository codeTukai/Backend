import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema(
    {
        subscription: {
            type: Schema.Types.ObjectId, //one who is subscribing (user)
            ref:"User"
            
        },
        channel:{
            type: Schema.Types.ObjectId, //subscriber
            ref: "User"
        }


    },{timestamps: true})



export const Subscription = mongoose.model("Subscription",subscriptionSchema);