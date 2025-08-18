import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res){
    try {
        console.log("Generating Stream token for user:", req.user.id);
        const token = await generateStreamToken(req.user.id);
        
        if (!token) {
            throw new Error("Failed to generate token");
        }
        
        console.log("Stream token generated successfully");
        res.status(200).json({token});
    } catch (error) {
       console.error("Error in getStreamToken controller:", error.message);
       res.status(500).json({message: "Internal server Error", error: error.message}); 
    }
}