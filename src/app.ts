import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat";
import cors from "cors";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

// Add more detailed logging
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
	console.log("Headers:", req.headers);
	next();
});

// CORS Configuration
app.use(
	cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose
	.connect(process.env.MONGO_URI || "")
	.then(() => {
		console.log("Connected to MongoDB");
	})
	.catch((err: Error) => {
		console.error("Error connecting to MongoDB:", err);
	});

// Routes
app.use("/chat", chatRoutes);
// app.use('/seed', seedRoutes);

// Add a test route
app.get("/api/health", (req, res) => {
	console.log("Health check endpoint hit");
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		host: HOST,
		port: PORT,
	});
});

// Error handling middleware
app.use(
	(
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		console.error("Error:", err);
		res.status(500).json({ error: err.message });
	}
);

// Start server with error handling
const server = app
	.listen(PORT, HOST, () => {
		console.log(`Server is running on http://${HOST}:${PORT}`);
		console.log("CORS is enabled for all origins");
	})
	.on("error", (err) => {
		console.error("Server failed to start:", err);
	});

// Handle process termination
process.on("SIGTERM", () => {
	console.log("SIGTERM received. Shutting down gracefully...");
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
});
