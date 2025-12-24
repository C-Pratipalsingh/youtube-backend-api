import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body || {};
    if (!content) throw new apiError(422, "Content is required!!");

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if (!tweet) throw new apiError(500, "Something went wrong while creating a tweet!!");

    return res.status(201).json(new apiResponse(201, tweet, "Tweet created successfully!!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    let { page = 1, limit = 2 } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) throw new apiError(400, "Valid userId is required!!");

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const aggregate = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 0, username: 1, avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: {
                createdAt: -1,
            }
        },
    ];

    const tweets = await Tweet.aggregatePaginate(Tweet.aggregate(aggregate), options);
    if (!tweets) {
        throw new apiError(400, "Error while fetching videos!! OR Tweet not found!!");
    }

    res.status(200).json(new apiResponse(200, tweets, "All tweets fetched successfully!!"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body || {};

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) throw new apiError(400, "Valid tweetId is required!!");

    if (!content) throw new apiError(422, "Content is required!!");

    const updatedTweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id },
        {
            $set: {
                content
            }
        },
        { new: true }
    );

    if (!updatedTweet) throw new apiError(500, "Something went wrong while updating tweet!! OR Unauthorized!!");

    return res.status(201).json(new apiResponse(201, updatedTweet, "Tweet updated successfully!!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) throw new apiError(400, "Valid tweetId is required!!");

    const deletedTweet = await Tweet.findOneAndDelete(
        { _id: tweetId, owner: req.user._id },
    );

    if (!deletedTweet) throw new apiError(500, "Something went wrong while deleting tweet!! OR Unauthorized!!");

    return res.status(201).json(new apiResponse(201, {}, "Tweet deleted successfully!!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet }