import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 2 } = req.query;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new apiError(400, "Valid videoId is required!!");
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const aggregate = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId),
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
                            _id: 0, username: 1, avatar: "$avatar.url"
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
    ]

    const comments = await Comment.aggregatePaginate(Comment.aggregate(aggregate), options);

    if (comments?.totalDocs === 0) throw new apiError(500, "Something went wrong while fetching comments!! OR No video available on that ID!!");

    return res.status(200).json(new apiResponse(200, comments, "Comments fetched successfully!!"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body || {};

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required!!");

    if (!content) throw new apiError(422, "Content is required!!");

    const video = await Video.findById(videoId).select("_id owner isPublished");
    if (!video) throw new apiError(404, "Video not found!!");

    if (video.isPublished === false && !video.owner.equals(req.user._id)) throw new apiError(403, "You cannot comment on a private video!!");

    const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user._id
    })

    if (!comment) throw new apiError(400, "Something went wrong while creating comment!!");

    return res.status(201).json(
        new apiResponse(201, comment, "Comment published successfully!!")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body || {};

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) throw new apiError(400, "Valid commentId is required!!");

    if (!content) throw new apiError(422, "Content is required!!");

    const updatedComment = await Comment.findOneAndUpdate(
        { _id: commentId, owner: req.user._id },
        {
            $set:
            {
                content
            }
        },
        { new: true }
    );
    if (!updatedComment) throw new apiError(400, "Comment not found!! OR Unauthorized!!");

    return res.status(201).json(new apiResponse(201, updatedComment, "Comment updated successfully!!"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!commentId || !mongoose.Types.ObjectId.isValid(commentId)) throw new apiError(400, "Valid commentId is required!!");

    const deletedComment = await Comment.findOneAndDelete(
        { _id: commentId, owner: req.user._id }
    );
    if (!deletedComment) throw new apiError(400, "Comment not found!! OR Unauthorized!!");

    return res.status(201).json(new apiResponse(201, {}, "Comment deleted successfully!!"));
});

export {
    getVideoComments, addComment, updateComment, deleteComment
}