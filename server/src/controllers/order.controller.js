const { Order, Gig } = require("../models");
const { CustomException } = require("../utils");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);    
// console.log("Stripe Key:", process.env.STRIPE_SECRET_KEY); // ✅ Add this line

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const getOrders = async (request, response) => {
  try {
    const orders = await Order.find({
      $and: [
        { $or: [{ sellerID: request.userID }, { buyerID: request.userID }] },
        { isCompleted: true },
      ],
    }).populate(
      request.isSeller ? "buyerID" : "sellerID",
      "username email image country"
    );

    return response.send(orders);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

const paymentIntent = async (request, response) => {
  const { _id } = request.params;

  try {
    // ✅ Check gig exists
    const gig = await Gig.findOne({ _id });
    if (!gig) throw CustomException("Gig not found", 404);

    // ✅ Check price exists and is a valid number
    if (!gig.price || typeof gig.price !== "number") {
      throw CustomException("Invalid gig price", 400);
    }

    // ✅ Create payment intent
    const payment_intent = await stripe.paymentIntents.create({
      amount: gig.price * 100, // convert to paise
      currency: "INR",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // ✅ Create and save order with paymentIntent ID
    const order = new Order({
      gigID: gig._id,
      image: gig.cover,
      title: gig.title,
      buyerID: request.userID,
      sellerID: gig.userID,
      price: gig.price,
      payment_intent: payment_intent.id,
    });

    await order.save();

    // ✅ Send clientSecret to frontend
    return response.status(200).send({
      error: false,
      clientSecret: payment_intent.client_secret,
    });
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

const updatePaymentStatus = async (request, response) => {
  const { payment_intent } = request.body;

  try {
    const order = await Order.findOneAndUpdate(
      { payment_intent },
      { $set: { isCompleted: true } },
      { new: true }
    );

    if (order?.isCompleted) {
      return response.status(202).send({
        error: false,
        message: "Order has been confirmed!",
      });
    }

    throw CustomException("Payment status not updated!", 500);
  } catch ({ message, status = 500 }) {
    return response.status(status).send({
      error: true,
      message,
    });
  }
};

module.exports = {
  getOrders,
  paymentIntent,
  updatePaymentStatus,
};
