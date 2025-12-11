const Product = require("../models/Product");

// ---------- CREATE PRODUCT (vendor only) ----------
const createProduct = async (req, res) => {
  try {
    console.log("FILES RECEIVED:", req.files);

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

    // Cloudinary URLs
    const images = req.files?.map((file) => file.path) || [];

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
};

// ---------- GET ALL PRODUCTS ----------
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

// ---------- GET PRODUCT BY ID ----------
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category")
      .populate("vendor");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- GET MY PRODUCTS (vendor only) ----------
const getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { category } = req.query;

    const filter = { vendor: vendorId };

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Get my products error:", error);
    res.status(400).json({ message: error.message });
  }
};

// ---------- UPDATE PRODUCT ----------
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

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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

    // If new Cloudinary images provided, replace images
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
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

// ---------- DELETE PRODUCT ----------
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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
