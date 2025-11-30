const Review = require("../models/Review");
const bodyParser=require('body-parser')
const Sentiment=require('sentiment')

// Simple sentiment detection
const detectSentiment = (text = "") => {
  const lower = text.toLowerCase();

  const positiveWords = ["good", "great", "awesome", "excellent", "love", "nice", "satisfied", "happy"];
  const negativeWords = ["bad", "worst", "poor", "terrible", "hate", "disappointed", "angry"];

  let score = 0;

  positiveWords.forEach((w) => {
    if (lower.includes(w)) score += 1;
  });

  negativeWords.forEach((w) => {
    if (lower.includes(w)) score -= 1;
  });

  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
};

// Create Review
const createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const sentiment = detectSentiment(comment || "");

    const review = await Review.create({
      product,
      rating,
      comment,
      sentiment,
      user: req.user._id,
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Create review error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Get All Reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user product");
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update Review
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) {
      updates.comment = comment;
      updates.sentiment = detectSentiment(comment);
    }

    const review = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error("Update review error:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete Review
const deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
};
