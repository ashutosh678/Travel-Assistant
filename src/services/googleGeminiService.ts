import { GoogleGenAI, Type } from "@google/genai";
import { logger } from "../utils/logger";
import dotenv from "dotenv";
import { IntentEnum } from "../enums/IntentEnum";

dotenv.config();

const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;

export class GoogleGeminiService {
	private ai: GoogleGenAI;

	constructor() {
		if (!GEMINI_API_KEY) {
			logger.error("Gemini API key is missing");
			throw new Error("Gemini API key is missing");
		}
		this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
	}

	public async generateText(prompt: string): Promise<string> {
		try {
			logger.info(
				"Sending request to Google Gemini API for text generation..."
			);

			const response = await this.ai.models.generateContent({
				model: "gemini-2.0-flash",
				contents: prompt,
				config: {
					responseMimeType: "application/json",
				},
			});

			logger.info("Received response from Google Gemini API", response);

			if (
				!response ||
				!response.candidates ||
				response.candidates.length === 0
			) {
				logger.error("No text generated from Gemini API");
				throw new Error("No text generated from Gemini API");
			}

			let generatedText = response.candidates[0].content!.parts![0].text!;
			logger.info("Text generated:", generatedText);

			const summaryMatch = generatedText.match(/"summary":\s*"([^"]+)"/);
			const summary = summaryMatch ? summaryMatch[1] : generatedText;

			return summary;
		} catch (error) {
			logger.error("Error generating text with Google Gemini", error);
			throw new Error("Error generating text with Google Gemini");
		}
	}

	public async generateStructuredOutput(
		prompt: string
	): Promise<
		{ source: string; destination: string; date: string; intent: IntentEnum }[]
	> {
		try {
			logger.info(
				"Sending request to Google Gemini API for structured output generation..."
			);

			// Define the response schema
			const responseSchema = {
				type: Type.ARRAY,
				items: {
					type: Type.OBJECT,
					properties: {
						source: {
							type: Type.STRING,
						},
						destination: {
							type: Type.STRING,
						},
						date: {
							type: Type.STRING,
						},
						intent: {
							type: Type.STRING,
						},
						city: {
							type: Type.STRING,
						},
					},
					propertyOrdering: ["source", "destination", "date", "intent", "city"],
				},
			};

			const finalPrompt = `
			You are a travel assistant. You are given a user's message and you need to extract the intent and the structured data from the message.
			Here is the user's message: ${prompt}
			Here is the structured data you need to extract: ${JSON.stringify(
				responseSchema
			)}
			Here is the intent you need to extract: /"flight_search"/, /"restaurant_search"/, /"hotel_search"/ 
			If any data is missing, dont't return it.
			`;

			const response = await this.ai.models.generateContent({
				model: "gemini-2.0-flash",
				contents: finalPrompt,
				config: {
					responseMimeType: "application/json",
					responseSchema: responseSchema, // Use the defined response schema
				},
			});

			logger.info(
				"Received structured response from Google Gemini API",
				response
			);

			if (
				!response ||
				!response.candidates ||
				response.candidates.length === 0
			) {
				logger.error("No structured data generated from Gemini API");
				throw new Error("No structured data generated from Gemini API");
			}

			const structuredData = JSON.parse(
				response.candidates[0].content!.parts![0].text!
			);
			logger.info("Structured data generated:", structuredData);

			return structuredData;
		} catch (error) {
			logger.error(
				"Error generating structured output with Google Gemini",
				error
			);
			throw new Error("Error generating structured output with Google Gemini");
		}
	}
}
