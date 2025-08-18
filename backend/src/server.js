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
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, //allow frontend to send cookies
}))
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

// Serve frontend build if it exists (works in prod and dev after build)
const distPath = path.join(__dirname, "../frontend/dist");
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
} else if (process.env.NODE_ENV !== "production") {
    // In development, if no build is present, redirect root to Vite dev server
    app.get("/", (req, res) => {
        res.redirect("http://localhost:5173/");
    });
}
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}` );
    connectDB();
})
