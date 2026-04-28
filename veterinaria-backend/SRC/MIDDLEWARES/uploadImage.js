const multer = require("multer");

// CAMBIO CLAVE: En lugar de diskStorage, usamos memoryStorage
const storage = multer.memoryStorage(); 

// Filtro de seguridad (se mantiene igual)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Formato no soportado. Solo JPG, PNG y WebP."), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Límite de 5MB (Crítico si va a la Base de Datos)
    },
    fileFilter: fileFilter,
});

module.exports = upload;