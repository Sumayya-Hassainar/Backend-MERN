const express = require('express');
const {
  registerCustomer,
  loginCustomer,
  getCustomers,
  getCustomerProfile,
} = require('../controllers/customerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 🔹 Public Routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// 🔹 Protected Routes
router.get('/profile', protect, getCustomerProfile);

// 🔹 Admin Routes
router.get('/', protect, adminOnly, getCustomers);

module.exports = router;
