import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import mongoose from "mongoose";
const port = process.env.PORT || 3000;

dotenv.config({
    path: "../.env"
})

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        process.on("SIGINT", async () => {
            console.log("\nReceived SIGINT. Closing database connection...");
            await mongoose.disconnect();
            console.log("MongoDB connection closed.");
            process.exit(0);
        });

        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        })
    })
    .catch((err) => {
        console.log("MONGODB connection failed!!!", err);
    })