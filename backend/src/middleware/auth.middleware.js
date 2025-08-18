import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async(req, res, next) => {
    try {
        console.log(`[auth] ${req.method} ${req.originalUrl}`);
        const token = req.cookies.jwt;

        if(!token){
            console.log("[auth] No JWT cookie found");
            return res.status(401).json({message: "Unauthorized -- No token provided"});
        }

        const decoded= jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decoded){
            console.log("[auth] JWT verification failed");
            return res.status(401).json({message: "Unauthorized -- Invalid token"});
        }
        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            console.log(`[auth] User not found for id: ${decoded.userId}`);
            return res.status(401).json({message: "Unauthorized -- User not found"});
        }
        req.user = user;
        console.log(`[auth] Authenticated user: ${user._id}`);
        next();
    }catch (error) {
        console.log("[auth] Error in protectRoute middleware", error?.message || error);
        res.status(500).json({message: "Interval Server Error"});
    }
};