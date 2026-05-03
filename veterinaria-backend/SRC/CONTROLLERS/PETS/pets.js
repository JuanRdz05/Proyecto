const Pets = require("../../MODELS/pets.js");
const { createLog } = require("../../MIDDLEWARES/logs.js");

const safeLog = async (action, resource, description, metadata, userId) => {
	try {
		await createLog(action, resource, description, metadata, userId);
	} catch (logError) {
		console.warn("[safeLog] Log no creado, pero operación continúa");
	}
};

async function addPet(req, res) {
	try {
		const userId = req.user.id;
		const petData = { ...req.body, owner: userId };
		const pet = new Pets(petData);
		await pet.save();

		await safeLog(
			"CREATE",
			"PET",
			`Registro de la mascota "${pet.name}" (${pet.petType || "tipo no especificado"})`,
			{
				petId: pet._id,
				petName: pet.name,
				petType: pet.petType,
				petBreed: pet.breed,
			},
			userId,
		);

		res.status(201).json({ message: "Mascota agregada", pet });
	} catch (error) {
		console.error("Error al agregar la mascota: ", error);
		res.status(500).json({ message: "Error al agregar la mascota", error });
	}
}

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

const modifyPet = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;

		const pet = await Pets.findById(petId);
		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}

		if (pet.owner.toString() !== userId.toString()) {
			return res
				.status(403)
				.json({ message: "No puedes modificar mascotas ajenas" });
		}

		const oldData = {
			name: pet.name,
			petType: pet.petType,
			breed: pet.breed,
			age: pet.age,
		};

		const updatePet = await Pets.findByIdAndUpdate(petId, req.body, {
			new: true,
			runValidators: true,
		});

		await safeLog(
			"UPDATE",
			"PET",
			`Modificación de la mascota "${oldData.name}"`,
			{
				petId: petId,
				oldData: oldData,
				newData: {
					name: updatePet.name,
					petType: updatePet.petType,
					breed: updatePet.breed,
					age: updatePet.age,
				},
			},
			userId,
		);

		res.status(200).json({ message: "Mascota modificada", updatePet });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

const getPetById = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;

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

async function getAllPets(req, res) {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1);
		const limit = Math.min(5, parseInt(req.query.limit) || 5);
		const skip = (page - 1) * limit;

		const [pets, total] = await Promise.all([
			Pets.find({})
				.populate("owner", "name paternalLastName maternalLastName email")
				.select("-__v")
				.skip(skip)
				.limit(limit),
			Pets.countDocuments({}),
		]);

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

const changeStatus = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;

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

		if (!pet.isActive && pet.disabledByAdmin) {
			return res.status(403).json({
				message:
					"Esta mascota fue desactivada por un administrador. Contacta al administrador para reactivarla.",
			});
		}

		const oldStatus = pet.isActive;
		const updatedPet = await Pets.findByIdAndUpdate(
			petId,
			{ isActive: !pet.isActive },
			{ new: true },
		);

		const actionType = updatedPet.isActive ? "Activación" : "Desactivación";

		await safeLog(
			"UPDATE",
			"PET",
			`${actionType} de la mascota "${pet.name}"`,
			{
				petId: petId,
				petName: pet.name,
				oldStatus: oldStatus,
				newStatus: updatedPet.isActive,
				disabledByAdmin: updatedPet.disabledByAdmin,
			},
			userId,
		);

		res
			.status(200)
			.json({ message: "Estado de la mascota cambiado", pet: updatedPet });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

const adminTogglePetStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const pet = await Pets.findById(id);

		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}

		const oldStatus = pet.isActive;
		const nowActive = !pet.isActive;
		pet.isActive = nowActive;
		pet.disabledByAdmin = !nowActive;
		await pet.save();

		const actionType = pet.isActive ? "Activación" : "Desactivación";

		await safeLog(
			"UPDATE",
			"PET",
			`${actionType} de la mascota "${pet.name}" por administrador`,
			{
				petId: pet._id,
				petName: pet.name,
				oldStatus: oldStatus,
				newStatus: pet.isActive,
				disabledByAdmin: pet.disabledByAdmin,
			},
			req.user?.id,
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

const deletePet = async (req, res) => {
	try {
		const petId = req.params.id;
		const user = req.user;

		const pet = await Pets.findById(petId);

		if (!pet) {
			return res.status(404).json({ message: "Mascota no encontrada" });
		}

		// Cliente solo puede eliminar sus propias mascotas, admin puede eliminar cualquiera
		if (user.role !== "admin" && pet.owner.toString() !== user.id.toString()) {
			return res
				.status(403)
				.json({ message: "No tienes permiso para eliminar esta mascota" });
		}

		const petData = {
			petId: pet._id,
			petName: pet.name,
			petType: pet.petType,
			ownerId: pet.owner,
		};

		await Pets.findByIdAndDelete(petId);

		await safeLog(
			"DELETE",
			"PET",
			`Eliminación permanente de la mascota "${petData.petName}" (${petData.petType})`,
			petData,
			user.id || user._id,
		);

		res
			.status(200)
			.json({ message: "Mascota eliminada permanentemente" });
	} catch (error) {
		console.error("Error al eliminar la mascota:", error);
		res
			.status(500)
			.json({ message: "Error al eliminar la mascota", error: error.message });
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
	deletePet,
};

