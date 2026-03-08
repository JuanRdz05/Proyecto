const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		paternalLastName: {
			type: String,
			required: true,
		},
		maternalLastName: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			unique: true,
			required: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		profilePicture: {
			type: String,
		},
		role: {
			type: String,
			enum: ["client", "vet", "admin"],
			default: "client",
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		username: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

//Virtual para obtener las mascotas del usuario
userSchema.virtual("pets", {
	ref: "pets",
	localField: "_id",
	foreignField: "owner",
});

module.exports = mongoose.model("Users", userSchema);
