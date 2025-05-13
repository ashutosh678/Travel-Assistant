import { Request, Response } from "express";
// import { AIService } from "../services/aiService";
import Flight from "../models/flights";
import Restaurant from "../models/restaurants";
import Hotel from "../models/hotels";
import { GoogleGeminiService } from "../services/googleGeminiService";
import { IntentEnum } from "../enums/IntentEnum";
import { logger } from "../utils/logger";
const geminiService = new GoogleGeminiService();

export class ChatController {
	static async handleChat(req: Request, res: Response) {
		const userMessage = req.body.message;
		let session = req.cookies.session ? JSON.parse(req.cookies.session) : {};

		logger.info("Received request:", { userMessage, session });

		const structuredOutput = await geminiService.generateStructuredOutput(
			userMessage
		);
		logger.info("Structured output:", structuredOutput);

		structuredOutput.forEach((data) => {
			session = { ...session, ...data };
		});

		if (!session.date) {
			const extractedDate = extractDate(userMessage);
			if (extractedDate) {
				session.date = extractedDate;
			}
		}

		logger.info("Session:", session);

		res.cookie("session", JSON.stringify(session), { httpOnly: true });

		if (session.city && session.intent !== IntentEnum.FLIGHT_SEARCH) {
			switch (session.intent) {
				case IntentEnum.RESTAURANT_SEARCH:
					return await ChatController.handleRestaurantSearch(session.city, res);

				case IntentEnum.HOTEL_SEARCH:
					return await ChatController.handleHotelSearch(session.city, res);
				default:
					logger.info("Could not understand the request");
					res.json({
						message: "Sorry, I couldn't understand your request.",
						session,
					});
			}
		}

		if (session.city && !session.destination) {
			session.destination = session.city;
		} else if (session.city && !session.source) {
			session.source = session.city;
		}

		const missingFields = ChatController.getMissingFields(session);

		if (missingFields.length > 0) {
			logger.info(`Missing fields: ${missingFields.join(", ")}`);
			return res.json({
				followUp: `Please provide the following missing information: ${missingFields.join(
					", "
				)}`,
				session,
			});
		}

		return await ChatController.handleFlightSearch(session, res);
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

		session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });

		res.json({ result: flights, message: responseText, session });
	}

	private static async handleRestaurantSearch(location: string, res: Response) {
		const restaurants = await Restaurant.find({ location });
		const session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });
		res.json({ result: restaurants });
	}

	private static async handleHotelSearch(city: string, res: Response) {
		const hotels = await Hotel.find({ city });
		const session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });
		res.json({ result: hotels });
	}

	static clearSession(res: Response) {
		const session = {};
		res.cookie("session", JSON.stringify(session), { httpOnly: true });
		console.log("Session cleared.");
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
}

function extractDate(msg: string): Date | null {
	const match = msg.match(
		/\b(\d{1,2})\s*(May|June|July)|\b(May|June|July)\s*(\d{1,2})\b/i
	);
	if (match) {
		const day = match[1] || match[4];
		const month = match[2] || match[3];
		const year = new Date().getFullYear();
		const monthIndex = {
			May: 4,
			June: 5,
			July: 6,
		}[month.charAt(0).toUpperCase() + month.slice(1).toLowerCase()];
		const date = new Date(
			Date.UTC(year, monthIndex, parseInt(day), 12, 0, 0, 0)
		);
		return date;
	}
	return null;
}
