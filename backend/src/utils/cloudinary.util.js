import { cloudinary } from "../config/cloudinary.js";

// Upload image to Cloudinary
export const uploadImage = async (buffer, folder = "uploads") => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Error uploading image");
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) throw new Error("No publicId provided");
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw new Error("Error deleting image");
  }
};
