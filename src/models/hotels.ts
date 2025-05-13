import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	city: { type: String, required: true },
	stars: { type: Number, required: true },
	room_price: { type: Number, required: true },
	availability: { type: Boolean, required: true },
});

export default mongoose.model("Hotel", hotelSchema);
