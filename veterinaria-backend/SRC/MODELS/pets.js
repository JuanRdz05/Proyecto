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
			trim: true, // Elimina espacios en blanco accidentales
		},
		birthday: {
			type: Date,
			required: true,
		},
		// Consolidamos todo en un solo campo descriptivo
		petType: {
			type: String,
			required: true,
			enum: {
				values: ["perro", "gato", "conejo", "ave", "reptil", "pez", "otro"],
				message: "{VALUE} no es un tipo de mascota soportado",
			},
		},
		weight: {
			type: Number,
			required: true,
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
