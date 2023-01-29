const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require("../middleware/authentication");

const {
  getAllOrder,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
} = require("../controllers/orderController");
const { create } = require("../models/Review");

router
  .route("/")
  .post(authenticateUser, createOrder)
  .get(authenticateUser, authorizePermissions("admin"), getAllOrder);

router.route("/showAllMyOrders").get(authenticateUser, getCurrentUserOrders);

router
  .route("/:id")
  .patch(authenticateUser, updateOrder)
  .get(authenticateUser, getSingleOrder);

module.exports = router;
