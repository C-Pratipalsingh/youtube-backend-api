import mongoose from "mongoose"
import { Subscription } from "../models/subscription.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) throw new apiError(400, "Valid channelId is required!!");
    if (req.user._id.equals(channelId)) throw new apiError(400, "User cannot subscribe to itself!!")

    const existing = await Subscription.findOne({ subscriber: req.user._id, channel: channelId });
    if (existing) {
        await existing.deleteOne();
        return res.status(200).json(new apiResponse(200, { subscribed: false }, "Toggled successfully!!"));
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })
    return res.status(201).json(new apiResponse(201, { subscribed: true }, "Toggled successfully!!"));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { page = 2, limit = 5 } = req.query;
    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) throw new apiError(400, "Valid channelId is required!!");

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            _id: 0, username: 1, avatar: "$avatar.url"
                        }
                    },
                ]
            }
        },
        {
            $unwind: {
                path: "$subscribers",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                username: "$subscribers.username",
                avatar: "$subscribers.avatar"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ]);

    if (!subscribers) throw new apiError(500, "Something went wrong while retriving subscribers!! || Channel not found!!");

    return res.status(200).json(new apiResponse(200, subscribers, "Subscribers retrived successfully!!"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const { page = 2, limit = 5 } = req.query;
    if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) throw new apiError(400, "Valid subscriberId is required!!");

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                            _id: 0, username: 1, avatar: "$avatar.url"
                        }
                    }
                ]
            }
        },
        {
            $unwind: {
                path: "$channels",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                username: "$channels.username",
                avatar: "$channels.avatar"
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
    ]);

    if (!channels) throw new apiError(500, "Something went wrong while retriving channels!! || Subscriber not found!!");

    return res.status(200).json(new apiResponse(200, channels, "Channels retrived successfully!!"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}