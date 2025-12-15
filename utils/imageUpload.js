const cloudinary = require("../config/cloudinary");

/**
 * Upload a file to Cloudinary
 * @param {string} filePath - Local path to the file
 * @returns {Promise<string>} - Resolves with the secure URL
 */
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder: "products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
  });
};

module.exports = uploadToCloudinary;
