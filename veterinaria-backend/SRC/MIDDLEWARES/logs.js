const Logs = require("../MODELS/logs.js");

/**
 * Crea un log de auditoría en la base de datos.
 *
 * @param {string} action - Tipo de acción: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
 * @param {string} resource - Recurso afectado: USER, PET, APPOINTMENT, MEDICALRECORD, SERVICE, LOG
 * @param {string} description - Descripción legible de la acción
 * @param {Object} [metadata] - Datos adicionales (cambios, IDs relacionados, etc.)
 * @param {string|ObjectId} [userId] - ID del usuario que realizó la acción
 * @returns {Promise<Object>} El log creado
 * @throws {Error} Si falla la creación del log
 */
const createLog = async (
	action,
	resource,
	description,
	metadata = null,
	userId = null,
) => {
	try {
		// Validar que la acción sea válida según el enum del schema
		const validActions = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"];
		if (!validActions.includes(action)) {
			throw new Error(
				`Acción inválida: ${action}. Debe ser una de: ${validActions.join(", ")}`,
			);
		}

		// Validar que el recurso sea válido según el enum del schema
		const validResources = [
			"USER",
			"PET",
			"APPOINTMENT",
			"MEDICALRECORD",
			"SERVICE",
			"LOG",
		];
		if (!validResources.includes(resource)) {
			throw new Error(
				`Recurso inválido: ${resource}. Debe ser uno de: ${validResources.join(", ")}`,
			);
		}

		const log = new Logs({
			action,
			resource,
			description,
			metadata: metadata || undefined, // No guardar null, mejor undefined
			user: userId || undefined, // No guardar null
		});

		const savedLog = await log.save();

		console.log(
			`[AUDIT] ${action} ${resource} - ${description.substring(0, 60)}...`,
		);

		return savedLog;
	} catch (error) {
		// Loggear el error pero NO detener la operación principal
		console.error("[AUDIT ERROR] Error al crear log:", {
			action,
			resource,
			description: description?.substring(0, 100),
			error: error.message,
			stack: error.stack,
		});

		// Relanzar para que el llamador pueda decidir qué hacer
		throw error;
	}
};

/**
 * Middleware de Express que crea un log automáticamente después de una acción exitosa.
 * Úsalo como: app.post('/ruta', verifyToken, logAction('CREATE', 'USER'), controller)
 *
 * NOTA: Esto es opcional, para uso futuro con middleware de Express.
 */
const logAction = (action, resource, getDescription, getMetadata) => {
	return async (req, res, next) => {
		// Guardar la referencia original de res.json para interceptar respuestas exitosas
		const originalJson = res.json.bind(res);

		res.json = function (data) {
			// Restaurar json original
			res.json = originalJson;

			// Solo loggear si la respuesta fue exitosa (2xx)
			if (res.statusCode >= 200 && res.statusCode < 300) {
				const description =
					typeof getDescription === "function"
						? getDescription(req, data)
						: getDescription || `${action} ${resource}`;

				const metadata =
					typeof getMetadata === "function"
						? getMetadata(req, data)
						: getMetadata || {};

				// Fire and forget - no bloquear la respuesta
				createLog(
					action,
					resource,
					description,
					metadata,
					req.user?.id || req.user?._id,
				).catch((err) =>
					console.error("[AUDIT] Log automático falló:", err.message),
				);
			}

			return originalJson(data);
		};

		next();
	};
};

module.exports = {
	createLog,
	logAction,
};
