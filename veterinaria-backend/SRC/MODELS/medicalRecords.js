import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
			unique: true,
		},
		pet: {
			type: Number,
			ref: "pets",
			required: true,
		},
		appointment: {
			type: Number,
			ref: "appointments",
			required: false, // Puede haber registros sin cita (emergencias)
		},
		vet: {
			type: Number,
			ref: "users",
			required: true,
		},
		service: {
			type: Number,
			ref: "services",
			required: false,
		},
		diagnosis: {
			type: String,
			required: true,
		},
		treatment: {
			type: String,
		},
		prescriptions: [
			{
				medication: String,
				dosage: String,
				frequency: String,
				duration: String,
			},
		],
		symptoms: {
			type: String,
		},
		weight: {
			type: Number, // Peso en kg al momento de la consulta
		},
		temperature: {
			type: Number, // Temperatura en °C
		},
		notes: {
			type: String,
		},
		nextVisitDate: {
			type: Date,
		},
		attachments: [String], // URLs de radiografías, análisis, etc.
	},
	{
		timestamps: true,
	},
);

// Índices para búsquedas comunes
medicalRecordSchema.index({ pet: 1, createdAt: -1 });
medicalRecordSchema.index({ vet: 1 });

export default mongoose.model("medicalRecords", medicalRecordSchema);
