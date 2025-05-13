import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import chatRoutes from "./routes/chat";
import cors from "cors";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
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

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
