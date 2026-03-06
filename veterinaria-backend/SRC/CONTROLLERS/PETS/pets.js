const Pets = require("../../MODELS/pets.js");

async function getAllPets(req, res) {
	try {
		const pets = await Pets.find({}).select("-_id");
		console.log("===================================================");
		console.log("Mostrando todos las mascotas...");
		if (pets.length === 0) {
			console.log("===================================================");
			console.log("No hay mascotas por mostrar");
			return res
				.status(404)
				.json({ message: "No hay mascotas en la base de datos" });
		}
		res.status(200).json({ message: "Mascotas encontradas", pets });
	} catch (error) {
		console.error("Error al obtener las mascotas: ", error);
		res.status(500).json({ message: "Error al obtener las mascotas", error });
	}
}

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

const getPetsByUser = async (req, res) => {
	try {
		console.log("===================================================");
		console.log("Obteniendo mascotas de usuario...");
		const userId = req.user.id;
		const pets = await Pets.find({ owner: userId }).select("-_id");
		console.log("===================================================");
		console.log("Mascotas de usuario encontradas");
		if (pets.length === 0) {
			console.log("===================================================");
			console.log("No hay mascotas de usuario");
			return res.status(404).json({ message: "No hay mascotas de usuario" });
		}
		res.status(200).json({ message: "Mascotas de usuario encontradas", pets });
		console.log("===================================================");
		console.log("Mascotas de usuario encontradas exitosamente");
	} catch (error) {
		console.error("Error al obtener las mascotas de usuario: ", error);
		res
			.status(500)
			.json({ message: "Error al obtener las mascotas de usuario", error });
	}
};

const changeStatus = async (req, res, next) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;

		// Buscar mascota
		console.log("===================================================");
		console.log("Buscando mascota...");
		const pet = await Pets.findById(petId);

		//Validar que existe
		console.log("===================================================");
		console.log("Validando que la mascota existe...");
		if (!pet) {
			console.log("===================================================");
			console.log("Mascota no encontrada");
			return res.status(404).json({ message: "Mascota no encontrada" });
		}

		//Validar que tiene owner
		console.log("===================================================");
		console.log("Validando que la mascota tiene dueño...");
		if (!pet.owner) {
			console.log("===================================================");
			console.log("Esta mascota no tiene dueño asignado");
			return res.status(400).json({
				message: "Error: Esta mascota no tiene dueño asignado",
			});
		}
		//Verificando que sea el dueño de la mascota
		console.log("===================================================");
		console.log("Verificando que el dueño de la mascota es el usuario...");
		if (pet.owner.toString() !== userId.toString()) {
			console.log("===================================================");
			console.log("No puedes modificar mascotas ajenas");
			return res.status(403).json({
				message: "No puedes modificar mascotas ajenas",
			});
		}

		// Actualizar
		const updatedPet = await Pets.findByIdAndUpdate(
			petId,
			{ isActive: !pet.isActive },
			{ new: true },
		);
		console.log("===================================================");
		console.log("Mascota actualizada exitosamente");
		res.status(200).json({
			message: "Estado de la mascota cambiado",
			pet: updatedPet,
		});
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

const modifyPet = async (req, res) => {
	try {
		const petId = req.params.id;
		const userId = req.user.id;
		//Comenzamos a buscar la mascota
		console.log("===================================================");
		console.log("Buscando mascota...");
		const pet = await Pets.findByIdAndUpdate(petId, req.body, {
			new: true,
			runValidators: true,
		});
		//Validamos que la mascota exista
		console.log("===================================================");
		console.log("Validando que la mascota existe...");
		if (!pet) {
			console.log("===================================================");
			console.log("Mascota no encontrada");
			return res.status(404).json({ message: "Mascota no encontrada" });
		}
		//Validamos que el dueño sea el usuario
		console.log("===================================================");
		console.log("Validando que el dueño de la mascota es el usuario...");
		if (pet.owner.toString() !== userId.toString()) {
			console.log("===================================================");
			console.log("No puedes modificar mascotas ajenas");
			return res.status(403).json({
				message: "No puedes modificar mascotas ajenas",
			});
		}
		console.log("===================================================");
		console.log("Mascota actualizada exitosamente");
		res.status(200).json({ message: "Mascota modificada", pet });
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ message: "Error", error: error.message });
	}
};

module.exports = {
	getAllPets,
	addPet,
	getPetsByUser,
	changeStatus,
	modifyPet,
};
