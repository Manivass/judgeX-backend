const express = require("express");
const instance = require("../utils/razorpay");
const { membershipAmount } = require("../constant");
const Payment = require("../models/payment");
const userAuth = require("../middleware/userAuth");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

const payment = express.Router();

payment.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    if (!["Silver", "Gold"].includes(membershipType)) {
      return res.status(400).json({
        msg: "Invalid membership type",
      });
    }

    const { firstName, lastName, email } = req.user;

    const order = await instance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        email,
        membershipType: membershipType,
      },
    });

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    // Return back my order details to frontend
    res.json({ ...savedPayment.toJSON(), key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
});

payment.post("/payment/webhook", async (req, res) => {
  try {
    console.log("🔥 WEBHOOK HIT");

    const webhookSignature = req.get("X-Razorpay-Signature");
    const rawBody = req.body.toString();

    const isWebhookValid = validateWebhookSignature(
      rawBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "Webhook signature is invalid",
      });
    }

    const body = JSON.parse(rawBody);

    const event = body.event;
    const paymentDetails = body.payload.payment.entity;

    // rest of your code...

    return res.status(200).json({
      msg: "Webhook received successfully",
    });
  } catch (err) {
    console.error("Webhook Error:", err);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = payment;
