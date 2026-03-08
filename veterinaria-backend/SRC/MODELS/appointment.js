const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: true,
			validate: {
				validator: function (v) {
					// Validar formato HH:MM
					return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
				},
				message: "El formato de hora debe ser HH:MM",
			},
		},
		pet: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "pets",
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "users",
		},
		service: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "services",
		},
		status: {
			type: String,
			enum: ["Pendiente", "Aceptada", "Rechazada", "En progreso"],
			default: "pending",
			required: true,
		},
		notes: {
			type: String,
		},
		vet: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: "users",
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
			status: { $in: ["Aceptada", "En proceso"] },
			vet: { $exists: true },
		},
	},
);

module.exports = mongoose.model("Appointments", appointmentSchema);
