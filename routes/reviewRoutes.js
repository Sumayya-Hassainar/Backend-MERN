const express = require("express");
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const {
  protect,
  adminOnly,
  customerOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* ================= CREATE & READ ================= */

// create review → customer only
router.post("/", protect, customerOnly, createReview);

// get reviews
// - admin → all reviews
// - customer → filtered by product
router.get("/",protect ,adminOnly,getReviews)

/* ================= UPDATE & DELETE ================= */

router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
