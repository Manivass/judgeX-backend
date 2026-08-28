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
  console.log(" WEBHOOK HIT");

  try {
    const webhookSignature = req.get("X-Razorpay-Signature");

    console.log(
      "Webhook Secret:",
      process.env.RAZORPAY_WEBHOOK_SECRET
        ? process.env.RAZORPAY_WEBHOOK_SECRET
        : "MISSING",
    );

    if (!webhookSignature) {
      return res.status(400).json({
        msg: "Webhook signature missing",
      });
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(500).json({
        msg: "Webhook secret missing in server",
      });
    }

    if (!Buffer.isBuffer(req.body)) {
      return res.status(400).json({
        msg: "Raw webhook body missing",
      });
    }

    const isWebhookValid = validateWebhookSignature(
      req.body,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    if (!isWebhookValid) {
      return res.status(400).json({
        msg: "Webhook signature is invalid",
      });
    }

    // Convert raw Buffer → JSON
    const body = JSON.parse(req.body.toString());

    console.log("Webhook Event:", body.event);

    const event = body.event;

    const paymentDetails = body.payload.payment.entity;

    console.log("Razorpay Order ID:", paymentDetails.order_id);

    const paymentRecord = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!paymentRecord) {
      return res.status(404).json({
        msg: "Payment record not found",
      });
    }

    // Update payment status
    paymentRecord.status = paymentDetails.status;

    await paymentRecord.save();

    // Activate membership
    if (event === "payment.captured") {
      const user = await User.findById(paymentRecord.userId);

      if (!user) {
        return res.status(404).json({
          msg: "User not found",
        });
      }

      user.isPremium = true;

      user.membershipType = paymentRecord.notes.membershipType.toLowerCase();

      await user.save();
    }

    return res.status(200).json({
      success: true,
      msg: "Webhook received successfully",
    });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

payment.get("/payment/verify", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user;
    if (loggedUser.isPremium) {
      return res.status(200).json({ success: false, isPremium: true });
    }
    res.status(200).json({ success: false, isPremium: false });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});
module.exports = payment;
