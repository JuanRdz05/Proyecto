const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema(
	{
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

module.exports = mongoose.model("Logs", logsSchema);
