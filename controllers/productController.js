const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");
const uploadToCloudinary = require("../utils/imageUpload"); // your helper

// ------------------ CREATE PRODUCT ------------------
const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, category, price, discountPrice, stock, isActive } = req.body;
    const vendor = req.user._id;

    // Upload images using helper
    const images = [];
    if (req.files?.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        images.push(url);
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

// ------------------ GET ALL PRODUCTS ------------------
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

// ------------------ GET PRODUCT BY ID ------------------
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

// ------------------ GET MY PRODUCTS ------------------
const getMyProducts = asyncHandler(async (req, res) => {
  try {
    const vendorId = req.user._id;
    const filter = { vendor: vendorId };
    if (req.query.category) filter.category = req.query.category;

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ------------------ UPDATE PRODUCT ------------------
const updateProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.vendor) !== String(req.user._id))
      return res.status(403).json({ message: "Unauthorized" });

    const updateData = { ...req.body, updatedAt: new Date() };

    if (req.files?.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        newImages.push(url);
      }
      updateData.images = newImages; // replace old images
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
});

// ------------------ DELETE PRODUCT ------------------
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
