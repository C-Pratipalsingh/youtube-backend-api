import { Like } from "../models/like.model.js";

export const toggleLike = async (userId, contentType, contentId) => {
    const query = {likedBy: userId, [contentType]:contentId};
    
    const existing = await Like.findOne(query);
    
    if(existing) {
        await existing.deleteOne();
        return false;
    }

    await Like.create(query);
    return true;
};