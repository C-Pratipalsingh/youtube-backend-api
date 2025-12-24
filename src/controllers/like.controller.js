import mongoose from "mongoose";
import { Like } from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js"
import { toggleLike } from "../utils/toggleLike.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required!!");

    const liked = await toggleLike(req.user._id, 'video', videoId);
    if (!liked) {
        return res.status(200).json(new apiResponse(200, { liked: liked }, "Successfully toggled!!"));
    }

    return res.status(201).json(new apiResponse(201, { liked: liked }, "Successfully toggled!!"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) throw new apiError(400, "Valid commentId is required!!");

    const liked = await toggleLike(req.user._id, 'comment', commentId);
    if (!liked) {
        return res.status(200).json(new apiResponse(200, { liked: liked }, "Successfully toggled!!"));
    }

    return res.status(201).json(new apiResponse(201, { liked: liked }, "Successfully toggled!!"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId || !mongoose.Types.ObjectId.isValid(tweetId)) throw new apiError(400, "Valid tweetId is required!!");

    const liked = await toggleLike(req.user._id, 'tweet', tweetId);
    if (!liked) {
        return res.status(200).json(new apiResponse(200, { liked: liked }, "Successfully toggled!!"));
    }

    return res.status(201).json(new apiResponse(201, { liked: liked }, "Successfully toggled!!"));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Like.aggregate([
        {
            $match: {
                likedBy: userId,
                video: {
                    $exists: true
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerInfo",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 0, fullname: 1, username: 1, avatar: "$avatar.url"
                                    }
                                },
                            ]
                        }
                    },
                    {
                        $unwind: {
                            path: "$ownerInfo",
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            _id: 0, title: 1, description: 1, videoFile: 1, owner: "$ownerInfo"
                        }
                    },
                ]
            }
        },
        {
            $unwind: {
                path: "$videoDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                title: "$videoDetails.title",
                description: "$videoDetails.description",
                url: "$videoDetails.videoFile.url",
                owner: "$videoDetails.owner"
            }
        }
    ]);

    if (!videos.length) throw new apiError(500, "Something went wrong while fetching videos!! || No liked videos!!");

    return res.status(200).json(new apiResponse(200, videos, "Liked videos fetched successfully!!"));
})

export {
    getLikedVideos, toggleCommentLike, toggleVideoLike, toggleTweetLike
}