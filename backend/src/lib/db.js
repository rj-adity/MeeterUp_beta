import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return true;
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        console.error("❌ MongoDB connection failed - server will continue without database");
        console.error("❌ Check your MONGO_URI environment variable");
        return false;
    }
};