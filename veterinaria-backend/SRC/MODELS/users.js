import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
			autoIncrement: true,
		},
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

export default mongoose.model("users", userSchema);
