const express = require("express");
const router = express.Router();

const ctrl = require("../controllers/orderStatusController");
const { protect, vendorOnly, customerOnly } = require("../middleware/authMiddleware");

// CREATE STATUS (vendor only)
router.post("/", protect, vendorOnly, ctrl.createStatus);

// UPDATE / DELETE (vendor/admin handled in controller)
router.put("/:statusId", protect, ctrl.updateStatus);
router.delete("/:statusId", protect, ctrl.deleteStatus);

// VIEW STATUSES
router.get("/order/:orderId", protect, ctrl.getStatuses);

// CUSTOMER TRACK
router.get("/track/:orderId", protect, customerOnly, ctrl.getOrderTracking);

module.exports = router;
