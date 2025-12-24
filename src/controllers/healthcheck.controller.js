import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import os from "os";

const healthCheck = asyncHandler(async (req, res) => {

    if(!process.uptime()) throw new apiError(500, "Server uptime check failed!!");

    const stats = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime()+" secs",
        memory: process.memoryUsage(),
        load: process.cpuUsage(),
        platform: process.platform,
        version: process.version,
    }

    return res.status(200).json(new apiResponse(200, stats, "All Good!!"));
});

export { healthCheck }