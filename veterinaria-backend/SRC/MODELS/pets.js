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

module.exports = mongoose.model("Pets", petSchema);
