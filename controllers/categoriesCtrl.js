import asyncHandler from "express-async-handler";
import Category from "../model/Category.js";

// @desc    Create new  Category
// @route   POST  /api/v1/categories
// @access  Private/Admin

export const createCategoryCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;
  // category exist
  const categoryFound = await Category.findOne({ name });

  if (categoryFound) {
    throw new Error("Category already exists");
  }
  // category create
  const category = await Category.create({
    name: name.toLowerCase(),
    user: req.userAuthID,
    image: req?.file?.path,
  });
  res.json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

// @desc    fetch all categories
// @route   GET  /api/v1/categories
// @access  Private/Admin
export const getAllCategoriesCtrl = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.json({
    status: "success",
    message: "Categories fetched successfully",
    categories,
  });
});
// @desc    fetch single categories
// @route   GET  /api/v1/categories/:id
// @access  Private/Admin

export const getSingleCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new Error("Category not found");
  } else {
    res.json({
      status: "success",
      message: "Category fetched successfully",
      category,
    });
  }
});

// @desc    update categories
// @route   PUT  /api/v1/categories/:id
// @access  Private/Admin

export const updateCategoryCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;

  //update
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name,
    },
    {
      new: true,
    }
  );
  res.json({
    status: "success",
    message: "Category updated successfully",
    category,
  });
});

// @desc    Delete categories
// @route   DELETE  /api/v1/categories/:id
// @access  Private/Admin

export const deleteCategoryCtrl = asyncHandler(async (req, res) => {
  //delete
  await Category.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Category deleted successfully",
  });
});
