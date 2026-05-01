const Users = require("../../MODELS/users.js");
const { hashPassword } = require("../../MIDDLEWARES/passwords.js");
const bcrypt = require("bcrypt");

const validateEmail = (email) => {
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return regex.test(email);
};

const comparePassword = async (plainPassword, hashedPassword) => {
	return await bcrypt.compare(plainPassword, hashedPassword);
};

const updateProfile = async (req, res) => {
	try {
		const camposPermitidos = [
			"name",
			"paternalLastName",
			"maternalLastName",
			"email",
			"profilePicture",
		];
		const cambios = {};

		camposPermitidos.forEach((campo) => {
			if (req.body[campo] !== undefined && req.body[campo] !== "") {
				cambios[campo] = req.body[campo];
			}
		});

		// Si hay archivo de imagen subido por multer (diskStorage)
		if (req.file) {
			cambios.profilePicture = `/uploads/${req.file.filename}`;
		}

		if (cambios.email && !validateEmail(cambios.email)) {
			console.log("===================================================");
			console.log("El email no es valido");
			return res.status(400).json({ message: "El email no es valido" });
		}

		if (cambios.email) {
			const existe = await Users.findOne({
				email: cambios.email,
				_id: { $ne: req.user.id },
			});
			if (existe) {
				console.log("===================================================");
				console.log("El email ya existe");
				return res.status(400).json({ message: "El email ya existe" });
			}
		}

		const user = await Users.findByIdAndUpdate(req.user.id, cambios, {
			new: true,
			runValidators: true,
		});

		if (!user) {
			console.log("===================================================");
			console.log("No se pudo actualizar el perfil del usuario");
			return res
				.status(404)
				.json({ message: "No se pudo actualizar el perfil del usuario" });
		}

		console.log("===================================================");
		console.log("Perfil actualizado exitosamente");
		res.status(200).json({ message: "Perfil actualizado exitosamente", user });
	} catch (error) {
		console.error("Error al actualizar el perfil del usuario: ", error);
		res
			.status(500)
			.json({ message: "Error al actualizar el perfil del usuario", error });
	}
};

const updatePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				message: "Debe proporcionar la contraseña actual y la nueva",
			});
		}

		if (newPassword.length < 8) {
			return res.status(400).json({
				message: "La contraseña debe tener al menos 8 caracteres",
			});
		}

		const user = await Users.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.password,
		);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: "La contraseña actual es incorrecta",
			});
		}

		const isSamePassword = await comparePassword(newPassword, user.password);
		if (isSamePassword) {
			return res.status(400).json({
				message: "La nueva contraseña no puede ser igual a la anterior",
			});
		}

		const passwordHash = hashPassword(newPassword);

		const updatedUser = await Users.findByIdAndUpdate(
			req.user.id,
			{ password: passwordHash },
			{ new: true, runValidators: true },
		);

		console.log("===================================================");
		console.log("Contraseña actualizada exitosamente");

		const userResponse = updatedUser.toObject();
		delete userResponse.password;

		res.status(200).json({
			message: "Contraseña actualizada exitosamente",
			user: userResponse,
		});
	} catch (error) {
		console.error("Error al actualizar la contraseña: ", error);
		res.status(500).json({
			message: "Error al actualizar la contraseña",
		});
	}
};

module.exports = {
	updateProfile,
	updatePassword,
};
