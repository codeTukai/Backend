import mongoose, { Schema } from "mongoose"

const subscriptionSchema = new Schema(
    {
        subscriber: {
            type: Schema.Types.ObjectId, //one who is subscribe (user) the channel
            ref:"User"
            
        },
        channel:{
            type: Schema.Types.ObjectId, //whom is subscribed by user
            ref: "User"
        }
        


    },{timestamps: true})



export const Subscription = mongoose.model("Subscription",subscriptionSchema);