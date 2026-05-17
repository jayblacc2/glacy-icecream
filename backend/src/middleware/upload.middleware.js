import multer from "multer";
import path from "path";

//storage
const storage = multer.memoryStorage();

//file filter function: whitelist safe image types only (no SVG - XSS risk)
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const checkFileType = (req, file, cb) => {
  if (ALLOWED_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }
  cb(new Error("File type not supported. Allowed: JPEG, PNG, GIF, WebP"));
};

export const upload = multer({
  storage: storage,
  fileFilter: checkFileType,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const optionalUpload = (fieldName) => (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    upload.single(fieldName)(req, res, next);
  } else {
    next();
  }
};

export default upload;
