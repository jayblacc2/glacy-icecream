import multer from "multer";
import path from "path";

//storage
const storage = multer.memoryStorage();

//file filter function: check the file mime
const checkFileType = (req, file, cb) => {
  const mimeType = file.mimetype.startsWith("image");
  if (mimeType) {
    return cb(null, true);
  } else {
    cb(new Error("file type not supported"));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: checkFileType,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
