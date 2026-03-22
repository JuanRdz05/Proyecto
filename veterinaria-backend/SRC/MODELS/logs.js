const mongoose = require("mongoose");

const logsSchema = new mongoose.Schema(
	{
		action: {
			type: String,
			required: true,
			enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"],
		},
		resource: {
			type: String,
			required: true,
			enum: ["USER", "PET", "APPOINTMENT", "MEDICALRECORD", "SERVICE", "LOG"],
		},
		description: {
			type: String,
			required: true,
		},
		metadata: {
			type: mongoose.Schema.Types.Mixed,
			required: false,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Logs", logsSchema);
