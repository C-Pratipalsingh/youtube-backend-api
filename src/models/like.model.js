import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },

    }, { timestamps: true })

    likeSchema.pre('save', async function(next) {
        const fields = [this.video,this.comment,this.tweet].filter(Boolean);
        if(fields.length !== 1) {
            return next(new Error("Exactly one content type must be liked!!")); 
        }
        next();
    });

export const Like = mongoose.model("Like", likeSchema);