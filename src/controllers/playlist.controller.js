import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body || {}
    if (!(name && description)) throw new apiError(400, "Name and Description both required!!");

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    if (!playlist) throw new apiError(500, "Something went wrong while creating playlist!!");
    return res.status(201).json(new apiResponse(201, playlist, "Playlist created successfully!!"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    const { page = 1, limit = 2 } = req.query;

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    }

    if (!userId || !isValidObjectId(userId)) throw new apiError(400, "Valid userId is required!!");

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
        }
    ];

    const playlists = await Playlist.aggregatePaginate(Playlist.aggregate(aggregate), options);

    if (playlists?.totalDocs === 0) throw new apiError(500, "Something went wrong while fetching Playlists!! OR No user available on that ID!!");

    return res.status(200).json(new apiResponse(200, playlists, `${playlists.totalDocs} Playlists fetched successfully!!`));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) throw new apiError(400, "Valid playlistId is required!!");

    const playlist = await Playlist.findById(playlistId).lean();
    if (!playlist) throw new apiError(404, "Playlist not found!!");

    return res.status(200).json(new apiResponse(200, playlist, "Playlist fetched successfully!!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) throw new apiError(400, "Valid playlistId is required!!");
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required!!");

    const video = await Video.findById(videoId).lean();
    if (!video) throw new apiError(404, "Video not found!!");

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        { $push: { videos: videoId } },
        { new: true }
    ).lean();

    if (!playlist) throw new apiError(500, "Something went wrong while adding video to a playlist!!");

    return res.status(200).json(new apiResponse(200, playlist, "Video added successfully to the playlist!!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) throw new apiError(400, "Valid playlistId is required!!");
    if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) throw new apiError(400, "Valid videoId is required!!");

    const video = await Video.findById(videoId).lean();
    if (!video) throw new apiError(404, "Video not found!!");

    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) throw new apiError(500, "Something went wrong while removing video from a playlist!!");

    return res.status(200).json(new apiResponse(200, playlist, "Video removed successfully from the playlist!!"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId || !mongoose.Types.ObjectId.isValid(playlistId)) throw new apiError(400, "Valid playlistId is required!!");

    const deletedPlaylist = await Playlist.findOneAndDelete(
        { _id: playlistId, owner: req.user._id }
    ).lean();

    if (!deletedPlaylist) throw new apiError(400, "Playlist not found!! OR Unauthorized!!");

    return res.status(204).json(new apiResponse(204, {}, "Playlist deleted successfully!!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body || {};
    const updates = {};

    if (!playlistId || !isValidObjectId(playlistId)) throw new apiError(400, "Valid playlistId is required!!");

    if (!(name || description)) throw new apiError(400, "Name or Description is required!!");
    if (name) updates.name = name;
    if (description) updates.description = description;

    console.log(updates)

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        {
            $set: updates 
        },
        { new: true },
    ).lean();

    if (!updatedPlaylist) throw new apiError(500, "Something went wrong while updating Playlist!!");

    return res.status(201).json(new apiResponse(201, updatedPlaylist, "Playlist updated successfully!!"));
});

export { createPlaylist, getUserPlaylists, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist }