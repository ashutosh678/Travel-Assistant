export class AIService {
	static detectIntent(prompt: string | undefined): {
		intent: string;
		entities: any;
	} {
		if (!prompt) {
			return { intent: "unknown", entities: {} };
		}
		// Basic keyword-based intent detection
		if (prompt.toLowerCase().includes("flights")) {
			return { intent: "flight_search", entities: {} };
		} else if (prompt.toLowerCase().includes("restaurants")) {
			return { intent: "restaurant_search", entities: {} };
		}
		return { intent: "unknown", entities: {} };
	}

	static followUpQuestions(intent: string, entities: any): string | null {
		if (intent === "flight_search" && !entities.date) {
			return "Which date would you like to travel?";
		}
		return null;
	}
}
