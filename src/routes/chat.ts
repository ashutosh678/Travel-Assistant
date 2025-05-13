import { Router } from "express";
import { ChatController } from "../controllers/chatController";
import { clearSession } from "../helpers/sessionManager";

const router = Router();

router.post("/", ChatController.handleChat);

// Route to clear the session
router.get("/clear-session", (req, res) => {
	clearSession(res);
	res.json({ message: "Session cleared successfully." });
});

export default router;
