import mongoose from "mongoose";
import dotenv from "dotenv";
import Flight from "./models/flights";
import Hotel from "./models/hotels";
import Restaurant from "./models/restaurants";

dotenv.config();

const seedData = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI || "");

		const flights = [
			{
				id: 1,
				flight_name: "Air India",
				flight_number: "AI101",
				source: "Delhi",
				destination: "Mumbai",
				departure_time: "10:00 AM",
				arrival_time: "12:30 PM",
				duration: "2.5 hrs",
				date: new Date("2025-05-25"),
				price: 5000,
			},
			{
				id: 2,
				flight_name: "IndiGo",
				flight_number: "6E203",
				source: "Delhi",
				destination: "Bangalore",
				departure_time: "11:00 AM",
				arrival_time: "1:30 PM",
				duration: "2.5 hrs",
				date: new Date("2025-05-25"),
				price: 4500,
			},
			{
				id: 3,
				flight_name: "SpiceJet",
				flight_number: "SG401",
				source: "Mumbai",
				destination: "Delhi",
				departure_time: "2:00 PM",
				arrival_time: "4:30 PM",
				duration: "2.5 hrs",
				date: new Date("2025-05-25"),
				price: 4800,
			},
			{
				id: 4,
				flight_name: "Vistara",
				flight_number: "UK302",
				source: "Delhi",
				destination: "Chennai",
				departure_time: "3:00 PM",
				arrival_time: "5:30 PM",
				duration: "2.5 hrs",
				date: new Date("2025-05-25"),
				price: 5200,
			},
			{
				id: 5,
				flight_name: "GoAir",
				flight_number: "G8201",
				source: "Delhi",
				destination: "Kolkata",
				departure_time: "4:00 PM",
				arrival_time: "6:30 PM",
				duration: "2.5 hrs",
				date: new Date("2025-05-25"),
				price: 4700,
			},
		];

		const hotels = [
			{
				id: 1,
				name: "The Taj Mahal Palace",
				city: "Mumbai",
				stars: 5,
				room_price: 15000,
				availability: true,
			},
			{
				id: 2,
				name: "The Oberoi",
				city: "Delhi",
				stars: 5,
				room_price: 14000,
				availability: true,
			},
			{
				id: 3,
				name: "ITC Grand Chola",
				city: "Chennai",
				stars: 5,
				room_price: 13000,
				availability: false,
			},
			{
				id: 4,
				name: "Leela Palace",
				city: "Bangalore",
				stars: 5,
				room_price: 16000,
				availability: true,
			},
			{
				id: 5,
				name: "Trident",
				city: "Kolkata",
				stars: 4,
				room_price: 12000,
				availability: true,
			},
		];

		const restaurants = [
			{
				id: 1,
				name: "Bukhara",
				location: "Delhi",
				cuisine: "Indian",
				rating: 4.5,
				price_range: "$$$",
			},
			{
				id: 2,
				name: "Le Cirque",
				location: "Mumbai",
				cuisine: "French",
				rating: 4.7,
				price_range: "$$$$",
			},
			{
				id: 3,
				name: "Karavalli",
				location: "Bangalore",
				cuisine: "South Indian",
				rating: 4.6,
				price_range: "$$$",
			},
			{
				id: 4,
				name: "Peshawri",
				location: "Chennai",
				cuisine: "North Indian",
				rating: 4.4,
				price_range: "$$$",
			},
			{
				id: 5,
				name: "Oh! Calcutta",
				location: "Kolkata",
				cuisine: "Bengali",
				rating: 4.3,
				price_range: "$$",
			},
		];

		await Flight.insertMany(flights);
		await Hotel.insertMany(hotels);
		await Restaurant.insertMany(restaurants);

		console.log("Database seeded successfully");
		process.exit();
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	}
};

seedData();
