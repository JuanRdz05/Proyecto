import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
	{
		_id: {
			type: Number,
			required: true,
		},
		vet: {
			type: Number,
			ref: "users",
			required: true,
		},
		dayOfWeek: {
			type: Number,
			required: true,
			min: 0,
			max: 6,
		},
	},
	{
		timestamps: true,
	},
);

//Validación para evitar crear horarios para usuarios no veterinarios
scheduleSchema.pre("save", async function (next) {
	console.log("1. Comenzando busqueda de usuario");
	const user = mongoose.model("users");
	const userVet = await user.finddById(this.vet);
	console.log("2. Busqueda de usuarios finalizada");
	if (!userVet) {
		return ndxt(
			new Error("No existe el usuario asociado a la hora de atencion"),
		);
	}
	if (user.role !== "vet") {
		return next(
			new Error("Solo se pueden crear horarios para el staff de veterianarios"),
		);
	}
	console.log("3. Horario creado correctamente");
	next();
});

export default mongoose.model("schedule", scheduleSchema);
