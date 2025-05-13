import { Request, Response } from "express";
import { AIService } from "../services/aiService";
import Flight from "../models/flights";
import Restaurant from "../models/restaurants";
import Hotel from "../models/hotels";
import { GoogleGeminiService } from "../services/googleGeminiService";
import { IntentEnum } from "../enums/IntentEnum";
const geminiService = new GoogleGeminiService();

export class ChatController {
	static async handleChat(req: Request, res: Response) {
		const userMessage = req.body.message;
		let session = req.cookies.session ? JSON.parse(req.cookies.session) : {};

		console.log("Received request:", { userMessage, session });

		// Fetch structured output from Google Gemini API
		const structuredOutput = await geminiService.generateStructuredOutput(
			userMessage
		);
		console.log("Structured output:", structuredOutput);

		// Update session with structured data
		structuredOutput.forEach((data) => {
			session = { ...session, ...data };
		});

		// Attempt to extract date from user message if not provided
		if (!session.date) {
			const extractedDate = extractDate(userMessage);
			if (extractedDate) {
				session.date = extractedDate;
			}
		}

		console.log("Session:", session);

		// Store updated session in cookies
		res.cookie("session", JSON.stringify(session), { httpOnly: true });

		if (session.city) {
			// Handle different intents using the intent from the session
			console.log("================");
			switch (session.intent) {
				case IntentEnum.RESTAURANT_SEARCH:
					return await ChatController.handleRestaurantSearch(session.city, res);

				case IntentEnum.HOTEL_SEARCH:
					return await ChatController.handleHotelSearch(session.city, res);
				default:
					console.log("Could not understand the request");
					res.json({
						message: "Sorry, I couldn't understand your request.",
						session,
					});
			}
		}

		// Check for missing data
		const missingFields = ["source", "destination", "date", "intent"].filter(
			(field) => !session[field]
		);

		if (missingFields.length > 0) {
			console.log(`Missing fields: ${missingFields.join(", ")}`);
			return res.json({
				followUp: `Please provide the following missing information: ${missingFields.join(
					", "
				)}`,
				session,
			});
		}

		console.log("intent", session.intent);
		console.log("intent type", IntentEnum.FLIGHT_SEARCH);

		// Handle different intents using the intent from the session
		switch (session.intent) {
			case IntentEnum.FLIGHT_SEARCH:
				await ChatController.handleFlightSearch(session, res);
				break;
			case IntentEnum.RESTAURANT_SEARCH:
				await ChatController.handleRestaurantSearch(userMessage, res);
				break;
			case IntentEnum.HOTEL_SEARCH:
				await ChatController.handleHotelSearch(userMessage, res);
				break;
			default:
				console.log("Could not understand the request");
				res.json({
					message: "Sorry, I couldn't understand your request.",
					session,
				});
		}
	}

	private static async handleFlightSearch(session: any, res: Response) {
		const { source, destination, date } = session;

		// Use the extractDate function to parse the date
		const extractedDate = extractDate(date);

		// Check if extractedDate is valid
		if (!extractedDate || isNaN(extractedDate.getTime())) {
			console.log("Invalid date provided.");
			return res.json({
				message: "The date provided is invalid. Please provide a valid date.",
				session,
			});
		}

		// Log the extracted date for debugging
		console.log("Extracted Date:", extractedDate);

		// Convert the extractedDate to the desired ISO string format without timezone shift
		const formattedDate = new Date(
			Date.UTC(
				extractedDate.getUTCFullYear(),
				extractedDate.getUTCMonth(),
				extractedDate.getUTCDate(),
				0,
				0,
				0,
				0
			)
		).toISOString();

		console.log("Querying flights with date:", formattedDate);

		// Query the database using the formatted date
		const flights = await Flight.find({
			source,
			destination,
			date: new Date(formattedDate),
		});

		const flightsFound = flights.length;
		const responseText =
			flightsFound > 0
				? `Found ${flightsFound} flights from ${source} to ${destination} on ${extractedDate.toDateString()}.`
				: `No flights found from ${source} to ${destination} on ${extractedDate.toDateString()}.`;

		console.log("Response text:", responseText);

		// Clear the session after processing
		session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });

		res.json({ result: flights, message: responseText, session });
	}

	private static async handleRestaurantSearch(location: string, res: Response) {
		console.log("location", location);
		// const location = extractCity(userMessage);
		const restaurants = await Restaurant.find({ location });
		console.log("restaurants", restaurants);
		// const responseText = await geminiService.generateText(
		// 	`Found ${restaurants.length} restaurants in ${location}.`
		// );
		res.json({ result: restaurants });
	}

	private static async handleHotelSearch(city: string, res: Response) {
		const hotels = await Hotel.find({ city });
		// const responseText = await geminiService.generateText(
		// 	`Found ${hotels.length} hotels in ${city}.`
		// );
		res.json({ result: hotels });
	}

	// Function to clear the session
	static clearSession(res: Response) {
		const session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });
		console.log("Session cleared.");
	}
}

function extractCity(msg: string, preposition?: string): string | null {
	const match = msg.match(/(?:from|in|to)\s+([A-Za-z]+)/);
	return match ? match[1] : null;
}

function extractDate(msg: string): Date | null {
	const match = msg.match(/\b(May|June|July)\s+\d{1,2}\b/); // Simple match
	if (match) {
		const [month, day] = match[0].split(" ");
		const year = new Date().getFullYear(); // Use current year
		const monthIndex = {
			May: 4, // JavaScript months are 0-indexed (May is the 5th month, which is index 4)
			June: 5,
			July: 6,
		}[month];
		const date = new Date(
			Date.UTC(year, monthIndex, parseInt(day), 12, 0, 0, 0)
		);
		return date;
	}
	return null;
}
