const express = require("express");
const {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// any logged-in user can create review
router.route("/")
  .post(protect, createReview)
  .get(protect, adminOnly, getReviews); // maybe only admin can see all, up to you

// update & delete
router.route("/:id")
  .put(protect, updateReview)          // user who wrote review or admin (you can add extra check later)
  .delete(protect, deleteReview);

module.exports = router;
