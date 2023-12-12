import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import dbConnect from "../config/dbConnect.js";
import Stripe from "stripe";
dotenv.config();
import userRoutes from "../routes/usersRoute.js";
import { globalErrHandler, notFound } from "../middlewares/globalErrHandler.js";
import productsRouter from "../routes/productsRoute.js";
import categoriesRouter from "../routes/categoriesRouter.js";
import brandsRouter from "../routes/brandsRouter.js";
import colorRouter from "../routes/colorRouter.js";
import reviewRouter from "../routes/reviewRouter.js";
import ordersRouter from "../routes/ordersRouter.js";
import Order from "../model/Order.js";
import couponsRouter from "../routes/couponsRouter.js";

//db connect
dbConnect();

const app = express();
//cors
app.use(cors());
// stripe webhook
// stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_6e685301e2d112a04e834d650535c9cd6d74b48deb31627d696c88054ba60bfc";

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log("error", err.message);
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { orderId } = session.metadata;
      const paymentStatus = session.payment_status;
      const paymentMethod = session.payment_method_types[0];
      const totalAmount = session.amount_total;
      const currency = session.currency;
      // find the order
      const order = await Order.findByIdAndUpdate(
        JSON.parse(orderId),
        {
          totalPrice: totalAmount / 100,
          paymentMethod,
          paymentStatus,
          currency,
        },
        {
          new: true,
        }
      );
      // console.log(order);
    } else {
      return;
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// pass the incoming data
app.use(express.json());
//url encoded
app.use(express.urlencoded({ extended: true }));
//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/products", productsRouter);
app.use("/api/v1/categories", categoriesRouter);
app.use("/api/v1/brands", brandsRouter);
app.use("/api/v1/colors", colorRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/coupons", couponsRouter);

// global error handlers middleware
app.use(notFound);
app.use(globalErrHandler);
export default app;
