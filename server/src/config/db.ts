import mongoose from "mongoose";

const connectDB = async (): Promise<void> => { 
    try {
        const uri = process.env.MONGO_URI; 
        if (!uri) 
        throw new Error("MONGO_URI is not defined in environment variables");

        await mongoose.connect(uri);
        console.log("Connected to MongoDB!");

    }catch(error: unknown){
        if(error instanceof Error){
            console.error("Error connecting to MongoDB:", error.message);
        }

    }
};
export default connectDB;