// middleware/uploadProductImages.js

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// Allowed image formats
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products", // Cloudinary folder name
    allowed_formats: ALLOWED_FORMATS,
    resource_type: "image",
    transformation: [{ width: 800, crop: "limit" }],
  },
});

// Multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// 👉 Allow up to 4 images per product
const uploadProductImages = upload.array("images", 4);

module.exports = uploadProductImages;
