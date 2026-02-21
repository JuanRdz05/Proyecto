import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
		},
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
			type: Number,
			required: true,
			ref: "pets",
		},
		owner: {
			type: Number,
			required: true,
			ref: "users",
		},
		service: {
			// ← AGREGADO
			type: Number,
			required: true,
			ref: "services",
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
			default: "pending",
			required: true,
		},
		notes: {
			type: String,
		},
		vet: {
			type: Number,
			required: false, // ← Ahora es opcional (se asigna al aceptar)
			ref: "users",
		},
		medicalRecord: {
			// ← AGREGADO
			type: Number,
			ref: "medicalRecords",
			required: false,
		},
		rejectionReason: {
			// ← AGREGADO (opcional)
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
			status: { $in: ["accepted", "in_progress"] },
			vet: { $exists: true },
		},
	},
);

export default mongoose.model("appointments", appointmentSchema);
