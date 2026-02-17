import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		petType: {
			type: String,
			required: true,
			enum: ["perro", "gato", "conejo", "ave", "reptil", "otro"],
		},
		owner: {
			type: Number,
			required: true,
			ref: "users",
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

export default mongoose.model("pets", petSchema);
