import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
		},
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: true,
		},
		pet: {
			type: Number,
			required: true,
			ref: "pets",
		},
		owner: {
			type: Number,
			required: true,
			ref: "users",
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
			required: true,
		},
		notes: {
			type: String,
		},
		vet: {
			type: Number,
			required: true,
			ref: "users",
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("appointment", appointmentSchema);
