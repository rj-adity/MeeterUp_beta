import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendReqs, getRecommendedUsers, sendFriendRequest, updateProfile, unfriend, blockUser, unblockUser, getBlockedUsers, cancelFriendRequest, getUserConversations } from "../controllers/user.controller.js";


const router = express.Router();

//apply auth middleware to all the routes below 
router.use(protectRoute);

router.get("/",getRecommendedUsers);
router.get("/friends",getMyFriends);
router.delete("/friends/:id", unfriend);

router.post("/friend-request/:id",  sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend-request/:id", cancelFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);
router.get("/blocked", getBlockedUsers);

// blocking
router.post("/block/:id", blockUser);
router.delete("/block/:id", unblockUser);

// profile
router.put("/me", updateProfile);

// conversations
router.get("/:userId/conversations", getUserConversations);

export default router;