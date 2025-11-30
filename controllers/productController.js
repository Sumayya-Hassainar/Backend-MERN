// controllers/productController.js
const Product = require("../models/Product");

// helper to build image URLs from multer files
const buildImageUrls = (req, files) => {
  if (!files || files.length === 0) return [];

  return files
    .map((file) => {
      if (!file || !file.filename) return null;
      return `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`;
    })
    .filter(Boolean); // remove null
};

// ---------- CREATE PRODUCT (vendor only) ----------
const createProduct = async (req, res) => {
  try {
    console.log("FILES RECEIVED ON CREATE:", req.files);

    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      isActive,
    } = req.body;

    // ✅ vendor from auth token (protect + isVendor guarantees it)
    const vendor = req.user._id;

    const images = buildImageUrls(req, req.files);

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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- GET ALL PRODUCTS (public, for customers) ----------
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("vendor");
    res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- GET PRODUCT BY ID (public) ----------
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("vendor");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(400).json({ message: error.message });
  }
};
// ✅ NEW: Get products for logged-in vendor, optionally filtered by category
const getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user._id; // comes from protect middleware
    const { category } = req.query; // optional ?category=...

    const filter = { vendor: vendorId }; // only this vendor

    if (category) {
      filter.category = category; // category is ObjectId of Category
    }

    const products = await Product.find(filter)
      .populate("category", "name") // show category name
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- UPDATE PRODUCT (vendor only, own product) ----------
const updateProduct = async (req, res) => {
  try {
    console.log("FILES RECEIVED ON UPDATE:", req.files);

    const {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      isActive,
    } = req.body;

    // First find the product and check ownership
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.vendor) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You can only edit your own products" });
    }

    const updateData = {
      name,
      description,
      category,
      price,
      discountPrice,
      stock,
      isActive,
      updatedAt: new Date(),
    };

    if (req.files && req.files.length > 0) {
      updateData.images = buildImageUrls(req, req.files);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- DELETE PRODUCT (vendor only, own product) ----------
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (String(product.vendor) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own products" });
    }

    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
};
