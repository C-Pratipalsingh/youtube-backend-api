import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log("\nMongoDB already connected");
            return;
        }

        const connectInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDB connected !! DB HOST: ${connectInstance.connection.host}`);

    } catch (error) {
        console.log("MONGOOSE CONNECTION FAILED : ", error?.message);
        process.exit(1);
    }
};

export default connectDB;