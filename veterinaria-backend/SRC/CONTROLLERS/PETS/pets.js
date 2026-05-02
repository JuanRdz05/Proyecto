const Pets = require("../../MODELS/pets.js");

// Sin cambios — ya funciona bien
async function addPet(req, res) {
	try {
		console.log("===================================================");
		console.log("Agregando mascota...");
		const userId = req.user.id;
		const petData = { ...req.body, owner: userId };
		const pet = new Pets(petData);
		await pet.save();
		console.log("===================================================");
		console.log("Mascota agregada exitosamente");
		res.status(201).json({ message: "Mascota agregada", pet });
	} catch (error) {
		console.error("Error al agregar la mascota: ", error);
		res.status(500).json({ message: "Error al agregar la mascota", error });
	}
}

// Sin cambios — ya funciona bien
const getPetsByUser = async (req, res) => {
	try {
		const userId = req.user.id;
		const pets = await Pets.find({ owner: userId });
		if (pets.length === 0) {
			return res.status(404).json({ message: "No hay mascotas", pets: [] });
		}
		res.status(200).json(pets);
	} catch (error) {
		console.error("Error al obtener las mascotas de usuario: ", error);
		res.status(500).json({ message: "Error al obtener las mascotas", error });
	}
};

// Sin cambios — ya funciona bien
const modifyPet = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;
		console.log("===================================================");
		console.log("Buscando mascota...");
		const pet = await Pets.findById(petId);
		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}
		if (pet.owner.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ message: "No puedes modificar mascotas ajenas" });
		}
		const updatePet = await Pets.findByIdAndUpdate(petId, req.body, {
			new: true,
			runValidators: true,
		});
		console.log("===================================================");
		console.log("Mascota actualizada exitosamente");
		res.status(200).json({ message: "Mascota modificada", updatePet });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

// Sin cambios — ya funciona bien
const getPetById = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;
		console.log("===================================================");
		console.log("Buscando mascota...");
		const pet = await Pets.findById(petId);
		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}
		if (pet.owner.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Acceso denegado" });
		}
		res.status(200).json(pet);
	} catch (error) {
		console.error("Error al obtener la mascota: ", error);
		res.status(500).json({ message: "Error al obtener la mascota", error });
	}
};

// ── MODIFICADA: paginación + populate del dueño ────────────────────────────
async function getAllPets(req, res) {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(5, parseInt(req.query.limit) || 5);
		const skip = (page - 1) * limit;

		const [pets, total] = await Promise.all([
			Pets.find({})
				.populate("owner", "name paternalLastName maternalLastName email")
				.select("-__v") // solo excluimos __v, mantenemos _id
				.skip(skip)
				.limit(limit),
			Pets.countDocuments({}),
		]);

		console.log("===================================================");
		console.log(`Mostrando página ${page} — ${pets.length} mascotas`);

		res.status(200).json({
			message: "Mascotas encontradas",
			pets,
			pagination: {
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		console.error("Error al obtener las mascotas: ", error);
		res.status(500).json({ message: "Error al obtener las mascotas", error });
	}
}

// ── MODIFICADA: verifica disabledByAdmin antes de permitir al dueño reactivar
const changeStatus = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;

		console.log("===================================================");
		console.log("Buscando mascota...");
		const pet = await Pets.findById(petId);

		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}
		if (!pet.owner) {
			return res
				.status(400)
				.json({ message: "Esta mascota no tiene dueño asignado" });
		}
		if (pet.owner.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ message: "No puedes modificar mascotas ajenas" });
		}

		// Bloquear si fue desactivada por un admin
		if (!pet.isActive && pet.disabledByAdmin) {
			return res.status(403).json({
				message:
					"Esta mascota fue desactivada por un administrador. Contacta al administrador para reactivarla.",
			});
		}

		const updatedPet = await Pets.findByIdAndUpdate(
			petId,
			{ isActive: !pet.isActive },
			{ new: true },
		);
		console.log("===================================================");
		console.log("Estado de mascota actualizado por dueño");
		res
			.status(200)
			.json({ message: "Estado de la mascota cambiado", pet: updatedPet });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

// ── NUEVA: toggle exclusivo del admin ─────────────────────────────────────
const adminTogglePetStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const pet = await Pets.findById(id);
		if (!pet) return res.status(404).json({ message: "Mascota no encontrada" });

		const nowActive = !pet.isActive;
		pet.isActive = nowActive;
		pet.disabledByAdmin = !nowActive; // desactiva → true | activa → false

		await pet.save();

		console.log("===================================================");
		console.log(
			`[Admin] Mascota "${pet.name}" → ${pet.isActive ? "activa" : "inactiva"}`,
		);

		res.status(200).json({
			message: `Mascota ${pet.isActive ? "activada" : "desactivada"} por administrador`,
			pet: {
				_id: pet._id,
				name: pet.name,
				isActive: pet.isActive,
				disabledByAdmin: pet.disabledByAdmin,
			},
		});
	} catch (error) {
		console.error("Error al cambiar estado de mascota (admin):", error);
		res
			.status(500)
			.json({ message: "Error al cambiar estado de la mascota", error });
	}
};

module.exports = {
	getAllPets,
	addPet,
	getPetsByUser,
	changeStatus,
	modifyPet,
	getPetById,
	adminTogglePetStatus,
};
