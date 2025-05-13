import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
	id: { type: Number, required: true, unique: true },
	name: { type: String, required: true },
	location: { type: String, required: true },
	cuisine: { type: String, required: true },
	rating: { type: Number, required: true },
	price_range: { type: String, required: true },
});

export default mongoose.model("Restaurant", restaurantSchema);
