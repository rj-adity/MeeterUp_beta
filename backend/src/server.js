import express from "express" ;
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors";
import path from "path";

import fs from "fs";

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import chatRoutes from "./routes/chat.route.js"
import groupRoutes from "./routes/group.route.js"

import { connectDB } from "./lib/db.js";

// Load environment variables
dotenv.config();

// Debug environment variables and file paths
console.log("=== SERVER STARTUP DEBUG INFO ===");
console.log("Current working directory:", process.cwd());
console.log("Server file location:", import.meta.url);
console.log("Parent directory:", path.dirname(process.cwd()));
console.log("Files in current directory:", fs.readdirSync(process.cwd()));

console.log("=== ENVIRONMENT VARIABLES ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("STEAM_API_KEY:", process.env.STEAM_API_KEY ? "Present" : "Missing");
console.log("STEAM_API_SECRET:", process.env.STEAM_API_SECRET ? "Present" : "Missing");
console.log("JWT_SECRET_KEY:", process.env.JWT_SECRET_KEY ? "Present" : "Missing");
console.log("MONGO_URI:", process.env.MONGO_URI ? "Present" : "Missing");


// CORS configuration for development and production
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5001",
    "http://localhost:3000",
    "https://meeterup-beta.onrender.com",
    "https://meeterup-app.onrender.com",
    "https://5001-firebase-meeterupbetagit-1755642693913.cluster-d5vecjrg5rhlkrz6nm4jty7avc.cloudworkstations.dev"
];

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost on any port for development
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log("CORS blocked origin:", origin);
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
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} jwt:${hasJwt}`);
	} catch (error) {
		console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} error:${error.message}`);
	}
	next();
});

// Test route to verify server is working
app.get("/test", (req, res) => {
    res.json({ 
        message: "Server is working!", 
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
        port: PORT
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);

// API health check
app.get("/api/health", (req, res) => {
    res.json({ 
        message: "MeeterUp API is running", 
        status: "healthy",
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
});

// Serve frontend build if it exists (for production)
const possibleDistPaths = [
    path.join(__dirname, "../frontend/dist"),
    path.join(__dirname, "frontend/dist")
];

let distPath = null;
for (const path of possibleDistPaths) {
    if (fs.existsSync(path)) {
        distPath = path;
        console.log("✅ Found frontend build at:", distPath);
        break;
    }
}

if (distPath) {
    console.log("🚀 Serving frontend from:", distPath);
    app.use(express.static(distPath));
    
    // Handle SPA routing - serve index.html for all non-API routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    console.log("⚠️ No frontend build found, serving API only");
    app.get("/", (req, res) => {
        res.json({ 
            message: "MeeterUp API is running", 
            status: "API only mode",
            timestamp: new Date().toISOString()
        });
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("❌ Server error:", err);
    res.status(500).json({ 
        error: "Internal server error", 
        message: err.message,
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🧪 Test route: http://localhost:${PORT}/test`);
    
    // Connect to database
    try {
        const dbConnected = await connectDB();
        if (dbConnected) {
            console.log("✅ Database connection successful");
        } else {
            console.log("⚠️ Database connection failed - server running in limited mode");
        }
    } catch (error) {
        console.error("❌ Database connection error:", error);
        console.log("⚠️ Server will continue without database connection");
    }
});
