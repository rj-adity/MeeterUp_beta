import {StreamChat} from 'stream-chat';

import"dotenv/config";

const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

if(!apiKey || !apiSecret){
    console.error("Stream API key or secret key is missing: ");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async(userData) => {
    try {
        await streamClient.upsertUsers([userData]);
        return userData;
    } catch (error) {
        console.error("Error upserting stream user:", error);
    }
};
// make it later as async function.
export const generateStreamToken = (userId)=> {};