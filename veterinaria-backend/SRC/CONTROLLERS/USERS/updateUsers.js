const Users = require("../../MODELS/users.js");
const { hashPassword } = require("../../MIDDLEWARES/passwords.js");

//Funcion par actualizar el perfil del usuario
const updateProfile = async (req, res) => {
	try {
		//Campos permitidos para actualizar el perfil
		const camposPermitidos = [
			"name",
			"paternalLastName",
			"maternalLastName",
			"email",
		];
		const cambios = {};
		//Obtenemos los campos que se han enviado
		camposPermitidos.forEach((campo) => {
			if (req.body[campo]) {
				cambios[campo] = req.body[campo];
			}
		});

		if (cambios.email && !validateEmail(cambios.email)) {
			consol.log("===================================================");
			console.log("El email no es valido");
			return res.status(400).json({ message: "El email no es valido" });
		}
		//Verificar que el email sea único
		if (cambios.email) {
			const existe = await Users.findOne({ email: cambios.email });
			if (existe) {
				console.log("===================================================");
				console.log("El email ya existe");
				return res.status(400).json({ message: "El email ya existe" });
			}
		}
		//Guardamos los cambios a la base de datos
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

		//Validar que se enviaaron ambas contraseñas
		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				message: "Debe proporcionar la contraseña actual y la nueva",
			});
		}

		//Validar la fuerza de la contraseña
		if (newPassword.length < 8) {
			return res.status(400).json({
				message: "La contraseña debe tener al menos 8 caracteres",
			});
		}

		//Obtener el usuario actual
		const user = await Users.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "Usuario no encontrado" });
		}

		//Verificar que la contraseña actual sea correcta
		const isPasswordValid = await bcrypt.compare(currenPassword, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: "La contraseña actual es incorrecta",
			});
		}

		//No puede ser igual a la anterior
		const isSamePassword = await comparePassword(newPassword, user.password);
		if (isSamePassword) {
			return res.status(400).json({
				message: "La nueva contraseña no puede ser igual a la anterior",
			});
		}

		//Hashear la nueva contraseña
		const passwordHash = hashPassword(newPassword);

		//Actualizar la contraseña del usuario
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
			user: userResponse, // Sin la contraseña
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
