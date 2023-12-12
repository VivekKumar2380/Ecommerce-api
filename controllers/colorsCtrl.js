import Color from "../model/Color.js";
import asyncHandler from "express-async-handler";

// @desc     Create a new Color
// @route    POST api/v1/colors
// @access   private/admin

export const createColorCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;
  // color exists
  const colorFound = await Color.findOne({ name });
  if (colorFound) {
    throw new Error(`${name} Color already exists`);
  }
  //create a new color
  const color = await Color.create({
    name: name.toLowerCase(),
    user: req.userAuthID,
  });
  res.json({
    status: "success",
    message: "color created successfully",
    color,
  });
});

// @desc     get all Color
// @route    GET api/v1/colors
// @access   public

export const getAllColorsCtrl = asyncHandler(async (req, res) => {
  const colors = await Color.find();
  res.json({
    status: "success",
    message: "Colors fetched successfully",
    colors,
  });
});

// @desc     get single Color
// @route    GET api/v1/colors/:id
// @access   public

export const getSingleColorCtrl = asyncHandler(async (req, res) => {
  const color = await Color.findById(req.params.id);
  if (!color) {
    throw new Error("Color not found");
  } else {
    res.json({
      status: "success",
      message: "Color fetched successfully",
      color,
    });
  }
});

// @desc     update Color
// @route    PUT api/v1/colors/:id
// @access   private/admin

export const updateColorCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;

  const color = await Color.findByIdAndUpdate(
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
    message: "Color updated successfully",
    color,
  });
});

// @desc     Delete Color
// @route    Delete api/v1/colors/:id
// @access   private/admin

export const deleteColorCtrl = asyncHandler(async (req, res) => {
  await Color.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Color deleted successfully",
  });
});
