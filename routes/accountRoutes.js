// routes/accountRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMyAccount } = require("../controllers/accountController");

// GET /api/account/me
router.get("/me", protect, getMyAccount);

module.exports = router;
