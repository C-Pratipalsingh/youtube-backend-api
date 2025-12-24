import mongoose from "mongoose";
import { Video } from "../models/video.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js"
import { deleteImage, deleteVideo, uploadVideo, uploadImage } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
    const matchStage = {};

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new apiError(400, "valid userId is required")
    }

    matchStage.$or = [
        { owner: req.user._id },
        { owner: new mongoose.Types.ObjectId(userId), isPublished: true }
    ]
    if (query.trim() !== "") matchStage.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
    ];

    const options = {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 4
    }

    const aggregate = [
        {
            $match: matchStage
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
                            _id: 0, fullname: 1, username: 1, avatar: 1
                        }
                    },
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
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        },
    ];

    const videos = await Video.aggregatePaginate(Video.aggregate(aggregate), options);
    if (!videos) {
        throw new apiError(400, "Error while fetching videos || user not found!!");
    }
    return res.status(200).json(new apiResponse(
        200,
        videos,
        "Videos fetched successfully"
    ));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body || {}
    const videoFilePath = req.files?.videoFile?.[0]?.path;
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;

    if (!(title && description)) {
        throw new apiError(400, "Title and Description are required!!");
    }
    if (!(videoFilePath && thumbnailPath)) {
        throw new apiError(400, "Video and Thumbnail files are required!!");
    }

    const [videoFile, thumbnail] = await Promise.all([
        uploadVideo(videoFilePath),
        uploadImage(thumbnailPath)
    ])

    if (!(videoFile && thumbnail)) {
        throw new apiError(400, "Error while uploading Video & Thumbnail files!!");
    }

    const video = await Video.create({
        title,
        description,
        thumbnail: {
            url: thumbnail?.secure_url,
            public_id: thumbnail?.public_id
        },
        videoFile: {
            url: videoFile?.secure_url,
            public_id: videoFile?.public_id
        },
        duration: Math.floor(videoFile.duration),
        owner: req.user._id
    })

    if (!video) {
        throw new apiError(500, "Something went wrong while saving video to DB");
    }
    return res.status(201).json(
        new apiResponse(201, video, "Video uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required");

    const video = await Video.findById(videoId).select("owner isPublished");
    if (!video) throw new apiError(404, "Video not found!!");

    if (video.isPublished === false && !video.owner.equals(req.user._id)) throw new apiError(403, "Video is private");

    const incrementedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc: {
                views: 1
            }
        },
        { new: true }
    )

    return res.status(200).json(new apiResponse(200, incrementedVideo, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body || {};
    const thumbnailLocalPath = req.file?.path;

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required");

    if (!title || !description || !thumbnailLocalPath) {
        throw new apiError(422, "All fields are required");
    }

    const video = await Video.findById(videoId).select("owner thumbnail.public_id");
    if (!video) throw new apiError(404, "Video not found!!");

    if (!video.owner.equals(req.user._id)) throw new apiError(403, "Unauthorized access to another user's videos")

    const newThumbnail = await uploadImage(thumbnailLocalPath);
    if (!newThumbnail?.secure_url) throw new apiError(400, "Error while updating thumbnail");

    await deleteImage(video.thumbnail.public_id);

    const updatedVideoDetails = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                "thumbnail.url": newThumbnail?.secure_url,
                "thumbnail.public_id": newThumbnail?.public_id
            }
        },
        { new: true }
    );

    if (!updatedVideoDetails) throw new apiError(500, "Something went wrong while updating details");

    return res.status(201).json(new apiResponse(201, updatedVideoDetails, "Video details updated successfully!!"));
});

const deleteAVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(422, "Valid videoId is required!!");

    const video = await Video.findById(videoId).select("owner videoFile.public_id thumbnail.public_id")
    if (!video) throw new apiError(404, "Video not found!!");

    if (!video.owner.equals(req.user._id)) throw new apiError(403, "Unauthorized access to another user's videos")

    Promise.all([
        await deleteImage(video.thumbnail.public_id),
        await deleteVideo(video.videoFile.public_id)
    ])

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deleteAVideo) throw new apiError(500, "Something went wrong while deleting video!!");

    res.status(200).json(new apiResponse(200, deletedVideo, "Video deleted successfully!!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(422, "Valid videoId is required!!");

    const video = await Video.findById(videoId).select("owner");
    if (!video) throw new apiError(404, "Video not found!!");

    if (!video.owner.equals(req.user._id)) throw new apiError(403, "Unauthorized access to another user's videos")

    const toggledVideo = await Video.findByIdAndUpdate(
        videoId,
        [{
            $set: {
                isPublished: {
                    $not: "$isPublished"
                }
            }
        }],
        { new: true }
    )

    if (!toggledVideo) throw new apiError(500, "Something went wrong while toggling publish status!!");

    res.status(200).json(new apiResponse(200, toggledVideo, "Publish status changed successfully!!"))
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteAVideo, togglePublishStatus }