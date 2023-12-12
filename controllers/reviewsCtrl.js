import asyncHandler from "express-async-handler";
import Review from "../model/Review.js";
import Product from "../model/Product.js";

// @desc    create a review
// @route   POST api/vi/reviews
// @ access private/admin

export const createReviewCtrl = asyncHandler(async (req, res) => {
  const { message, rating } = req.body;
  // FInd the product for review
  const productFound = await Product.findById(req.params.productID).populate(
    "reviews"
  );

  if (!productFound) {
    throw new Error("Product not found");
  }
  // check if user already reviewed
  const hasReviewed = productFound?.reviews?.find((review) => {
    return review?.user?.toString() == req?.userAuthID?.toString();
  });
  if (hasReviewed) {
    throw new Error("You have already reviewed this product");
  }
  //create a review
  const review = await Review.create({
    message,
    rating,
    product: productFound?._id,
    user: req.userAuthID,
  });
  productFound.reviews.push(review?._id);
  await productFound.save();

  res.status(201).json({
    success: true,
    message: "review created successfully",
  });
});
