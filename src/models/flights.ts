import mongoose from "mongoose";

const flightSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	flight_name: { type: String, required: true },
	flight_number: { type: String, required: true },
	source: { type: String, required: true },
	destination: { type: String, required: true },
	departure_time: { type: String, required: true },
	arrival_time: { type: String, required: true },
	duration: { type: String, required: true },
	date: { type: Date, required: true },
	price: { type: Number, required: true },
});

export default mongoose.model("Flight", flightSchema);
