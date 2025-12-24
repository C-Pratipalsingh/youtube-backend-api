import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    //views
    const totalViews = await Video.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: null, totalViews: {$sum: "$views"} } },
        { $project: { _id: 0 } },
    ]);

    //videos
    const totalVideos = await Video.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: null, totalVideos: {$sum: 1} } },
        { $project: { _id: 0 } },
    ]);

    //subscribers
    const totalSubscribers = await Subscription.aggregate([
        { $match: { channel: req.user._id } },
        { $group: { _id: null, totalSubs: {$sum: 1} } },
        { $project: { _id: 0 } },
    ]);

    //likes

    const videoPipeline = [
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoData"
            }
        },
        {
            $unwind: {
                path: "$videoData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $match: {
                "videoData.owner": req.user._id
            }
        },
        {
            $count: "videoLikes"
        },
    ];
    const commentPipeline = [
        {
            $lookup: {
                from: "comments",
                localField: "comment",
                foreignField: "_id",
                as: "commentData"
            }
        },
        {
            $unwind: {
                path: "$commentData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $match: {
                "commentData.owner": req.user._id
            }
        },
        {
            $count: "commentLikes"
        },
    ];
    const tweetPipeline = [
        {
            $lookup: {
                from: "tweets",
                localField: "tweet",
                foreignField: "_id",
                as: "tweetData"
            }
        },
        {
            $unwind: {
                path: "$tweetData",
                preserveNullAndEmptyArrays: true,
            }
        },
        {
            $match: {
                "tweetData.owner": req.user._id
            }
        },
        {
            $count: "tweetLikes"
        },
    ];

    const [videoLikes, commentLikes, tweetLikes] = await Promise.all([
        Like.aggregate(videoPipeline),
        Like.aggregate(commentPipeline),
        Like.aggregate(tweetPipeline),
    ]);

    const totalLikes = videoLikes?.[0].videoLikes+commentLikes?.[0].commentLikes+tweetLikes?.[0].tweetLikes;

    const stats = {
        Videos: totalVideos?.[0].totalVideos,
        Subscribers: totalSubscribers?.[0].totalSubs,
        Views: totalViews?.[0].totalViews,
        Likes: totalLikes,
    }

    return res.status(200).json(new apiResponse(200, stats, "Channel stats fetched successfully!!"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const totalVideos = await Video.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: null, totalVideos: { $sum: 1 } } },
        { $project: { _id: 0 } },
    ])

    return res.status(200).json(new apiResponse(200, totalVideos?.[0], "Channel videos fetched successfully!!"));
})

export {
    getChannelStats,
    getChannelVideos
}