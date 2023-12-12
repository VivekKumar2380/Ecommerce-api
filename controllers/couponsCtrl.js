import asyncHandler from "express-async-handler";
import Coupon from "../model/Coupon.js";

//  @desc  create a new coupon
//  @route   POST  api/v1/coupons
//  @access    Private/Admin

export const createCouponCtrl = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  // admin should logged in
  // check if coupon already exists
  const couponExists = await Coupon.findOne({
    code,
  });
  if (couponExists) {
    throw new Error("Coupon already exists");
  }
  // check if discount ia number
  if (isNaN(discount)) {
    throw new Error("Discount value must be a number");
  }
  //create a new coupon
  const coupon = await Coupon.create({
    code: code?.toUpperCase(),
    startDate,
    endDate,
    discount,
    user: req.userAuthID,
  });
  //send response
  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    coupon,
  });
});

//  @desc    get all coupons
//  @route   GET  api/v1/coupons
//  @access    Private/Admin

export const getAllCouponsCtrl = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find();
  res.status(200).json({
    success: true,
    message: "All Coupons successfully",
    coupons,
  });
});

//  @desc     get singlecoupon
//  @route   GET  api/v1/coupons/:id
//  @access    Private/Admin

export const getCouponCtrl = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    throw new Error("Coupon not found");
  }

  if (coupon.isExpired) {
    throw new Error("Coupon expired");
  }
  res.status(200).json({
    success: true,
    message: "Coupon fetched successfully",
    coupon,
  });
});

//  @desc     update coupon
//  @route   PUT  api/v1/coupons/:id
//  @access    Private/Admin

export const updateCouponCtrl = asyncHandler(async (req, res) => {
  const { code, startDate, endDate, discount } = req.body;
  const updatedCoupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      code: code?.toUpperCase(),
      startDate,
      endDate,
      discount,
      user: req.userAuthID,
    },
    {
      new: true,
    }
  );
  res.status(201).json({
    success: true,
    message: "Coupon updated successfully",
    updatedCoupon,
  });
});

//  @desc     delete coupon
//  @route   DELETE  api/v1/coupons/:id
//  @access    Private/Admin

export const deleteCouponCtrl = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: "Coupon deleted successfully",
  });
});
