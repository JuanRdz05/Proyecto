import mongoose from "mongoose";

const servicesSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number, //Precio en pesos MX
			required: true,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("services", servicesSchema);
