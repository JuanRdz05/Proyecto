const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
	medication: { type: String, required: true },
	dosage: { type: String, required: true },
	frequency: { type: String, required: true },
	duration: { type: String, required: true },
	notes: { type: String },
});

const medicalRecordSchema = new mongoose.Schema(
	{
		pet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Pets",
			required: true,
		},
		appointment: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Appointments",
			required: true,
		},
		vet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Users",
			required: true,
		},
		service: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Services",
			required: true,
		},
		diagnosis: {
			type: String,
			required: true,
		},
		treatment: {
			type: String,
			required: true,
		},
		prescriptions: [prescriptionSchema],
		symptoms: {
			type: String,
		},
		weight: {
			type: Number,
		},
		temperature: {
			type: Number,
		},
		notes: {
			type: String,
		},
		nextVisitDate: {
			type: String, // YYYY-MM-DD, igual que las citas
		},
	},
	{
		timestamps: true,
	},
);

// Índices para búsquedas comunes
medicalRecordSchema.index({ pet: 1, createdAt: -1 });
medicalRecordSchema.index({ vet: 1 });
medicalRecordSchema.index({ appointment: 1 });

module.exports = mongoose.model("MedicalRecords", medicalRecordSchema);
