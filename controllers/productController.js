const Product = require("../models/Product");
const asyncHandler = require("express-async-handler");

const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    discountPrice,
    stock,
    isActive,
  } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  // Cloudinary URLs are already here
  const images = req.files?.map((file) => file.path) || [];

  const product = await Product.create({
    vendor: req.user._id,
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
});


// ------------------ GET ALL PRODUCTS ------------------
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .populate("category", "name")
    .populate("vendor", "name");

  res.status(200).json(products);
});

// ------------------ GET PRODUCT BY ID ------------------
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("vendor", "name");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json(product);
});

// ------------------ GET MY PRODUCTS ------------------
const getMyProducts = asyncHandler(async (req, res) => {
  const filter = { vendor: req.user._id };
  if (req.query.category) filter.category = req.query.category;

  const products = await Product.find(filter)
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.status(200).json(products);
});

// ------------------ UPDATE PRODUCT ------------------
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (String(product.vendor) !== String(req.user._id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const updateData = { ...req.body };
  const newImages = [];

  try {
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path);
        newImages.push(url);
        fs.unlinkSync(file.path);
      }

      updateData.images = newImages;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update product failed:", error);
    res.status(500).json({ message: "Update failed" });
  }
});

// ------------------ DELETE PRODUCT ------------------
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  if (String(product.vendor) !== String(req.user._id)) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  await product.deleteOne();
  res.status(200).json({ message: "Product deleted" });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  updateProduct,
  deleteProduct,
};
