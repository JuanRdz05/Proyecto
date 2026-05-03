const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		petType: {
			type: String,
			required: true,
		},
		birthDate: {
			type: Date,
			required: true,
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Users",
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		disabledByAdmin: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

module.exports = mongoose.model("Pets", petSchema);
