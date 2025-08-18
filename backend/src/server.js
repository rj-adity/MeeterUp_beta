import express from "express" ;
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import cors from "cors";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"

import { connectDB } from "./lib/db.js";

// Load environment variables
dotenv.config();

// Debug environment variables and file paths
console.log("Current working directory:", process.cwd());
console.log("Server file location:", import.meta.url);
console.log("Parent directory:", path.dirname(process.cwd()));
console.log("Files in current directory:", fs.readdirSync(process.cwd()));

console.log("Server environment variables loaded:", {
    STEAM_API_KEY: process.env.STEAM_API_KEY ? "Present" : "Missing",
    STEAM_API_SECRET: process.env.STEAM_API_SECRET ? "Present" : "Missing",
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV
});

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// CORS configuration for production
const allowedOrigins = [
    "http://localhost:5173",
    "https://meeterup-beta-lnvpu7s28-rj-aditys-projects.vercel.app",
    "https://meeterup-beta.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Increase body size limits to support base64 profile images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(cookieParser());

// Request logging (after cookies so we can log auth cookie presence)
app.use((req, res, next) => {
	try {
		const hasJwt = Boolean(req.cookies?.jwt);
		console.log(`[req] ${req.method} ${req.originalUrl} jwt:${hasJwt}`);
	} catch {
		console.log(`[req] ${req.method} ${req.originalUrl}`);
	}
	next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// API health check
app.get("/api/health", (req, res) => {
    res.json({ message: "MeeterUp API is running", status: "healthy" });
});

// For Vercel serverless functions
if (process.env.NODE_ENV === "production") {
    // Export for Vercel
    module.exports = app;
} else {
    // Local development
    app.listen(PORT, ()=> {
        console.log(`Server is running on port ${PORT}` );
        connectDB();
    });
}
