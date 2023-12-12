import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";
import Order from "../model/Order.js";
import User from "../model/User.js";
import Product from "../model/Product.js";
import Coupon from "../model/Coupon.js";

// @desc    place  order
// @route   POST  /api/v1/orders
// @access  Private

// stripe instance
const stripe = new Stripe(process.env.STRIPE_KEY);

export const createOrderCtrl = asyncHandler(async (req, res) => {
  // Coupon applied
  const { coupon } = req?.query;
  const couponFound = await Coupon.findOne({
    code: coupon?.toUpperCase(),
  });

  if (couponFound?.isExpired) {
    throw new Error("Coupon has expired");
  }

  if (!couponFound) {
    throw new Error("Coupon does not exist");
  }

  // get discount

  const discount = couponFound?.discount / 100;

  // get the payload(customer,shipping address,ordrItems,totalprice)
  const { orderItems, shippingAddress, totalPrice } = req.body;
  // find the user
  const user = await User.findById(req.userAuthID);
  // check if the user has shipping address
  if (!user?.hasShippingAddress) {
    throw new Error(" Please provide a shipping address");
  }
  // checking the  orderItems
  if (orderItems?.length <= 0) {
    throw new Error("No order Items found");
  }

  // place/create the order and save inti databases

  const order = await Order.create({
    user: user.id,
    orderItems,
    shippingAddress,
    totalPrice: couponFound ? totalPrice - totalPrice * discount : totalPrice,
  });
  // console.log(order)
  //update product quantity

  const products = await Product.find({ _id: { $in: orderItems } });
  orderItems?.map(async (order) => {
    const product = products?.find((product) => {
      return product?._id?.toString() == order?._id?.toString();
    });
    if (product) {
      product.totalSold += order.qty;
    }
    await product.save();
  });
  // push the order into user
  user.orders.push(order?._id);
  await user.save();
  // make Payment (Stripe)
  //convert order items to have same structure that stripe need

  const convertedOrders = orderItems.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item?.name,
          description: item?.description,
        },
        unit_amount: item?.price * 100,
      },
      quantity: item?.qty,
    };
  });
  const session = await stripe.checkout.sessions.create({
    line_items: convertedOrders,
    metadata: {
      orderId: JSON.stringify(order?._id),
    },
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
  });

  res.send({ url: session.url });
});
// @desc    get all  orders
// @route   GET  /api/v1/orders
// @access  Private

export const getAllordersCtrl = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user");
  res.json({
    success: true,
    message: "All orders fetched successfully",
    orders,
  });
});

// @desc    get single  order
// @route   GET  /api/v1/orders/:id
// @access  Private

export const getSingleorderCtrl = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.status(201).json({
    success: true,
    message: "Order fetched successfully",
    order,
  });
});

// @desc    update order to delivered
// @route   PUT  /api/v1/orders/update/:id
// @access  Private/admin

export const updateOrderCtrl = asyncHandler(async (req, res) => {
  //update
  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );
  res.status(201).json({
    success: true,
    message: "Order status updated",
    updatedOrder,
  });
});

// @desc  get sales sum of orders
// @route  GET  /api/v1/orders/sales/sum
// @access  private/admin

export const getOrderStatsCtrl = asyncHandler(async (req, res) => {
  //Order stats

  const orders = await Order.aggregate([
    {
      $group: {
        _id: null,
        minimumSale: {
          $min: "$totalPrice",
        },
        totalSales: {
          $sum: "$totalPrice",
        },
        maximumSale: {
          $max: "$totalPrice",
        },
        avgSale: {
          $avg: "$totalPrice",
        },
      },
    },
  ]);

  //get the date
  const date = new Date();
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const saleToday = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: today,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  res.status(200).json({
    success: true,
    message: "Sales calculated successfully",
    orders,
    saleToday,
  });
});
