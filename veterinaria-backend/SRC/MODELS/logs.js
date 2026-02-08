import mongoose from "mongoose";

const logsSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
		},
		action: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		user: {
			type: Number,
			ref: "User",
			required: false,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.model("logs", logsSchema);
