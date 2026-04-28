const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema(
	{
		pet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "pets",
			required: true,
		},
		appointment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "appointments",
			required: false, // Puede haber registros sin cita (emergencias)
		},
		vet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "users",
			required: true,
		},
		service: {
			type: mongoose.Schema.Types.ObjectId,
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
	},
	{
		timestamps: true,
	},
);

// Índices para búsquedas comunes
medicalRecordSchema.index({ pet: 1, createdAt: -1 });
medicalRecordSchema.index({ vet: 1 });

module.exports = mongoose.model("MedicalRecords", medicalRecordSchema);
