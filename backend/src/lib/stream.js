import { StreamChat } from "stream-chat";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Explicitly load .env from the project root
const apiKey = process.env.STEAM_API_KEY;
const apiSecret = process.env.STEAM_API_SECRET;

console.log("Stream API Key after dotenv config:", apiKey ? "Loaded" : "Missing");
console.log("Stream API Secret after dotenv config:", apiSecret ? "Loaded" : "Missing");

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    if (!apiKey || !apiSecret) {
      throw new Error("Stream API credentials not configured");
    }

    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};

// 👇 add this
export default streamClient;
