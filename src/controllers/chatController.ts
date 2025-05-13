import { Request, Response } from "express";
// import { AIService } from "../services/aiService";
import Flight from "../models/flights";
import Restaurant from "../models/restaurants";
import Hotel from "../models/hotels";
import { GoogleGeminiService } from "../services/googleGeminiService";
import { IntentEnum } from "../enums/IntentEnum";
import { logger } from "../utils/logger";
import { extractDate } from "../helpers/extractDate";
import { extractFilters } from "../helpers/extractFilters";
import {
	getSession,
	storeSession,
	clearSession,
} from "../helpers/sessionManager";

const geminiService = new GoogleGeminiService();

export class ChatController {
	static async handleChat(req: Request, res: Response) {
		try {
			const userMessage = req.body.message;
			let session = getSession(req);

			logger.info("Received request:", { userMessage, session });

			const structuredOutput = await ChatController.getStructuredOutput(
				userMessage
			);
			session = ChatController.updateSessionWithStructuredData(
				session,
				structuredOutput
			);

			logger.info("Session:", session);

			storeSession(res, session);

			if (ChatController.isIntentHandled(session)) {
				const filters = extractFilters(userMessage);
				return await ChatController.handleIntent(session, res, filters);
			}

			const missingFields = ChatController.getMissingFields(session);
			if (missingFields.length > 0) {
				return ChatController.promptForMissingFields(
					res,
					missingFields,
					session
				);
			}

			return await ChatController.handleFlightSearch(session, res);
		} catch (error) {
			logger.error("Error handling chat:", error);
			res.status(500).json({ message: "Internal server error" });
		}
	}

	private static async handleFlightSearch(session: any, res: Response) {
		const { source, destination, date } = session;

		const extractedDate = extractDate(date);

		if (!extractedDate || isNaN(extractedDate.getTime())) {
			console.log("Invalid date provided.");
			return res.json({
				message: "The date provided is invalid. Please provide a valid date.",
				session,
			});
		}

		console.log("Extracted Date:", extractedDate);

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

		clearSession(res);

		res.json({ result: flights, message: responseText, session });
	}

	private static async handleRestaurantSearch(
		location: string,
		res: Response
	): Promise<void> {
		const restaurants = await Restaurant.find({ location });
		const responseText =
			restaurants.length > 0
				? `Found ${restaurants.length} restaurants in ${location}.`
				: `No restaurants found in ${location}.`;
		clearSession(res);
		res.json({ result: restaurants, message: responseText });
	}

	private static async handleHotelSearch(
		city: string,
		res: Response,
		filters?: any
	): Promise<void> {
		const query: any = { city };
		if (filters && filters.room_price) {
			query.room_price = filters.room_price;
		}
		const hotels = await Hotel.find(query);
		const responseText =
			hotels.length > 0
				? `Found ${hotels.length} hotels in ${city}.`
				: `No hotels found in ${city}.`;
		clearSession(res);
		res.json({ result: hotels, message: responseText });
	}

	private static getMissingFields(session: any): string[] {
		switch (session.intent) {
			case IntentEnum.FLIGHT_SEARCH:
				return ["source", "destination", "date"].filter(
					(field) => !session[field]
				);
			case IntentEnum.RESTAURANT_SEARCH:
			case IntentEnum.HOTEL_SEARCH:
				return ["city"].filter((field) => !session[field]);
			default:
				return [];
		}
	}

	private static async getStructuredOutput(
		userMessage: string
	): Promise<any[]> {
		logger.info("Fetching structured output from Google Gemini API...");
		return await geminiService.generateStructuredOutput(userMessage);
	}

	private static updateSessionWithStructuredData(
		session: any,
		structuredOutput: any[]
	): any {
		structuredOutput.forEach((data) => {
			session = { ...session, ...data };
		});
		if (!session.date && session.userMessage) {
			const extractedDate = extractDate(session.userMessage);
			if (extractedDate) {
				session.date = extractedDate;
			}
		}
		if (session.intent === IntentEnum.FLIGHT_SEARCH) {
			if (session.city) {
				if (!session.source) {
					session.source = session.city;
				} else if (!session.destination) {
					session.destination = session.city;
				}
			}
		}
		return session;
	}

	private static isIntentHandled(session: any): boolean {
		return session.city && session.intent !== IntentEnum.FLIGHT_SEARCH;
	}

	private static async handleIntent(
		session: any,
		res: Response,
		filters?: any
	): Promise<void> {
		switch (session.intent) {
			case IntentEnum.RESTAURANT_SEARCH:
				return await this.handleRestaurantSearch(session.city, res);
			case IntentEnum.HOTEL_SEARCH:
				return await this.handleHotelSearch(session.city, res, filters);
			default:
				logger.info("Could not understand the request");
				res.json({
					message: "Sorry, I couldn't understand your request.",
					session,
				});
		}
	}

	private static promptForMissingFields(
		res: Response,
		missingFields: string[],
		session: any
	): void {
		logger.info(`Missing fields: ${missingFields.join(", ")}`);
		res.json({
			followUp: `Please provide the following missing information: ${missingFields.join(
				", "
			)}`,
			session,
		});
	}
}
