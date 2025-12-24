import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMedia = async (localFilePath, resourceType) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: resourceType });

        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

const deleteMedia = async (publicId,resource_type) => {
    try {
        await cloudinary.uploader.destroy(publicId,{ resource_type:resource_type });
        // console.log('Delete result:', result);
    } catch (error) {
        console.error(`Error deleting : ${resource_type}`, error);
    }
};

const uploadImage = (localFilePath) => {
    return uploadMedia(localFilePath, 'image')
}
const uploadVideo = (localFilePath) => {
    return uploadMedia(localFilePath, 'video')
}
const deleteImage = (localFilePath) => {
    return deleteMedia(localFilePath,'image')
}
const deleteVideo = (localFilePath) => {
    return deleteMedia(localFilePath, 'video')
}

export { uploadImage, uploadVideo, deleteImage, deleteVideo };