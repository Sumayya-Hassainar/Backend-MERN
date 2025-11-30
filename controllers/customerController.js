const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 🔹 Register Customer
const registerCustomer = async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer)
      return res.status(400).json({ message: 'Customer already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name,
      email,
      password: hashedPassword,
      address,
      phone,
    });

    res.status(201).json({ message: 'Customer registered successfully', customer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔹 Login Customer
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer)
      return res.status(404).json({ message: 'Customer not found' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: customer._id, role: 'Customer' }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      customer: { id: customer._id, name: customer.name, email: customer.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get All Customers (Admin only)
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password');
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔹 Get Customer Profile
const getCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).select('-password');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomers,
  getCustomerProfile,
};
