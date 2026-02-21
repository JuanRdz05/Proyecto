import dotenv from "dotenv";
dotenv.config();

export const CLINIC_CONFIG = {
	diaAbierto: process.env.CLINIC_OPEN_DAYS,
	horaApertura: process.env.CLINIC_OPEN_TIME, // Hora de apertura (formato HH:mm)
	horaCierre: process.env.CLINIC_CLOSE_TIME, // Hora de cierre (formato HH:mm)
	duracionCita: process.env.CLINIC_SLOT_DURATION,
};

//Función para generar los espacio de horarios
export function generateSlots(horaApertura, horaCierre, duracionCita) {
	const slots = [];
	let tiempoActual = horaApertura;
	while (tiempoActual < horaCierre) {
		slots.push(tiempoActual);
		// Sumar 'duration' minutos
		const [hours, minutes] = tiempoActual.split(":").map(Number);
		const totalMinutes = hours * 60 + minutes + duracionCita;
		const newHours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
		const newMinutes = String(totalMinutes % 60).padStart(2, "0");
		tiempoActual = `${newHours}:${newMinutes}`;
	}

	return slots;
}
