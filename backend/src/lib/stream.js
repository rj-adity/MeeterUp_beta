import {StreamChat} from 'stream-chat';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

console.log("Environment variables loaded:", {
    STEAM_API_KEY: process.env.STEAM_API_KEY ? "Present" : "Missing",
    STEAM_API_SECRET: process.env.STEAM_API_SECRET ? "Present" : "Missing",
    NODE_ENV: process.env.NODE_ENV,
    PWD: process.env.PWD
});

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret key is missing: ", { apiKey: !!apiKey, apiSecret: !!apiSecret });
    console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('STEAM')));
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting stream user:", error);
        throw error;
    }
};

export const generateStreamToken = (userId)=> {
    try {
        if (!apiKey || !apiSecret) {
            throw new Error("Stream API credentials not configured");
        }
        
        // ensure userId is a string
        const userIdStr = userId.toString();
        const token = streamClient.createToken(userIdStr);
        
        if (!token) {
            throw new Error("Failed to generate token");
        }
        
        return token;
    } catch (error) {
        console.error("Error generating Stream token:", error);
        throw error;
    }
};