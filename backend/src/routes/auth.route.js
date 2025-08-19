import express from "express";
import { login, logout, onboard, signup, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router()

router.post("/signup",signup)
router.post("/login", login)
router.post("/logout",logout)

router.post("/onboarding", protectRoute, onboard)

// Password reset routes
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)

//check user is loged in or not
router.get("/me", protectRoute, (req, res)=>{
    res.status(200).json({success: true, user:req.user})
})

export default router;