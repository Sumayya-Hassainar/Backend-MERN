const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const asyncHandler = require("express-async-handler");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------- CREATE PRODUCT ----------
const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      isActive,
    } = req.body;

    const vendor = req.user._id;

    // Upload images to Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        images.push(result.secure_url);

        // Remove file from local storage after upload
        fs.unlinkSync(file.path);
      }
    }

    const product = await Product.create({
      vendor,
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      isActive,
      images,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ---------- GET ALL PRODUCTS ----------
const getProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate("category", "name")
      .populate("vendor", "name");

    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ---------- GET PRODUCT BY ID ----------
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("vendor", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ---------- GET MY PRODUCTS ----------
const getMyProducts = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { category } = req.query;

    const filter = { vendor: vendorId };
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ---------- UPDATE PRODUCT ----------
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.vendor) !== String(req.user._id))
      return res.status(403).json({ message: "Unauthorized" });

    const updateData = { ...req.body, updatedAt: new Date() };

    // Upload new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        newImages.push(result.secure_url);
        fs.unlinkSync(file.path);
      }
      // Replace old images with new ones
      updateData.images = newImages;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ---------- DELETE PRODUCT ----------
const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.vendor) !== String(req.user._id))
      return res.status(403).json({ message: "Unauthorized" });

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
};
