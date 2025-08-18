import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

// Log the token route hit for debugging
router.get("/token", protectRoute, (req, res, next) => {
	console.log(`[chat] GET /api/chat/token for user: ${req.user?._id}`);
	return getStreamToken(req, res).catch(next);
});

export default router;


