const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		date: {
			type: String, // ← Cambiado de Date a String
			required: true,
			// Formato: YYYY-MM-DD
		},
		time: {
			type: String,
			required: true,
			validate: {
				validator: function (v) {
					return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
				},
				message: "El formato de hora debe ser HH:MM",
			},
		},
		pet: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Pets", // ← Correcto
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Users", // ← CORREGIDO: era "users" (minúscula)
		},
		service: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Services", // ← Correcto
		},
		status: {
			type: String,
			enum: [
				"Pendiente",
				"Aceptada",
				"Rechazada",
				"En progreso",
				"Cancelada",
				"Terminada",
			],
			default: "Pendiente",
			required: true,
		},
		notes: {
			type: String,
		},
		vet: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: "Users", // ← CORREGIDO: era "users" (minúscula)
		},
		rejectionReason: {
			type: String,
		},
	},
	{
		timestamps: true,
	},
);

// Índice compuesto para evitar doble reserva del mismo slot
appointmentSchema.index(
	{ date: 1, time: 1, vet: 1 },
	{
		unique: true,
		partialFilterExpression: {
			status: { $in: ["Aceptada", "En progreso"] },
			vet: { $exists: true },
		},
	},
);

module.exports = mongoose.model("Appointments", appointmentSchema);
