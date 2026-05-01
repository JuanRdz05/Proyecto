const multer = require("multer");
const path = require("path");
const fs = require("fs");

// __dirname está en: veterinaria-backend/SRC/MIDDLEWARES/
// Subimos 2 niveles para llegar a: veterinaria-backend/
const uploadsDir = path.join(__dirname, "..", "..", "UPLOADS");

// Debug: muestra la ruta absoluta en consola
console.log("📁 [uploadImage.js] UPLOADS directory:", uploadsDir);

// Creamos la carpeta si no existe
if (!fs.existsSync(uploadsDir)) {
	fs.mkdirSync(uploadsDir, { recursive: true });
	console.log("✅ [uploadImage.js] Carpeta UPLOADS creada");
} else {
	console.log("✅ [uploadImage.js] Carpeta UPLOADS ya existe");
	// Listar archivos existentes
	const files = fs.readdirSync(uploadsDir);
	console.log("📄 [uploadImage.js] Archivos en UPLOADS:", files);
}

// Configuración de almacenamiento en disco
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		console.log("📝 [uploadImage.js] Guardando archivo en:", uploadsDir);
		cb(null, uploadsDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const filename = file.fieldname + "-" + uniqueSuffix + ext;
		console.log("📄 [uploadImage.js] Nombre del archivo:", filename);
		cb(null, filename);
	},
});

// Filtro de seguridad
const fileFilter = (req, file, cb) => {
	const allowedMimeTypes = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"image/gif",
	];
	if (allowedMimeTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Formato no soportado. Solo JPG, PNG, WebP y GIF."), false);
	}
};

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // Límite de 5MB
	},
	fileFilter: fileFilter,
});

module.exports = upload;
