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
  console.log("🔥 WEBHOOK HIT");

  try {
    console.log("1️⃣ Headers received");

    const webhookSignature = req.get("X-Razorpay-Signature");

    console.log("2️⃣ Signature:", webhookSignature ? "YES" : "NO");
    console.log("3️⃣ Raw body exists:", !!req.rawBody);
    console.log("4️⃣ Event:", req.body?.event);

    const isWebhookValid = validateWebhookSignature(
      req.rawBody,
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET,
    );

    console.log("5️⃣ Signature valid:", isWebhookValid);

    if (!isWebhookValid) {
      console.log("❌ INVALID SIGNATURE");

      return res.status(400).json({
        msg: "Webhook signature is invalid",
      });
    }

    const event = req.body.event;

    console.log("6️⃣ EVENT:", event);

    const paymentDetails = req.body.payload.payment.entity;

    console.log("7️⃣ PAYMENT DETAILS:", paymentDetails);

    const paymentRecord = await Payment.findOne({
      orderId: paymentDetails.order_id,
    });

    console.log("8️⃣ PAYMENT RECORD:", paymentRecord);

    if (!paymentRecord) {
      console.log("❌ PAYMENT RECORD NOT FOUND");

      return res.status(404).json({
        msg: "Payment record not found",
      });
    }

    paymentRecord.status = paymentDetails.status;

    await paymentRecord.save();

    console.log("9️⃣ PAYMENT UPDATED");

    if (event === "payment.captured") {
      const user = await User.findById(paymentRecord.userId);

      console.log("🔟 USER:", user);

      if (!user) {
        console.log("❌ USER NOT FOUND");

        return res.status(404).json({
          msg: "User not found",
        });
      }

      user.isPremium = true;
      user.membershipType = paymentRecord.notes.membershipType.toLowerCase();

      await user.save();

      console.log("🎉 PREMIUM ACTIVATED");
      console.log("USER:", user.email);
      console.log("MEMBERSHIP:", user.membershipType);
    }

    console.log("✅ WEBHOOK SUCCESS");

    return res.status(200).json({
      success: true,
      msg: "Webhook received successfully",
    });
  } catch (err) {
    console.error("❌ WEBHOOK ERROR");
    console.error(err);
    console.error(err.stack);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
module.exports = payment;
