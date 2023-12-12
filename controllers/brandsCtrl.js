import Brand from "../model/Brand.js";
import asyncHandler from "express-async-handler";

// @ desc   Create Brand
// @route    POST api/v1/brands/
// @access   Private/Admin

export const createBrandCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;
  // Brand exists
  const brandFound = await Brand.findOne({ name });
  if (brandFound) {
    throw new Error("Brand already exists");
  } else {
    //create a new brand
    const brand = await Brand.create({
      name: name.toLowerCase(),
      user: req.userAuthID,
    });
    res.json({
      status: "success",
      message: "Brand created successfully",
      brand,
    });
  }
});

// @ desc   GEt all Brands
// @route    GET api/v1/brands/
// @access   Public

export const getAllBrandsCtrl = asyncHandler(async (req, res) => {
  const brands = await Brand.find();

  res.json({
    status: "success",
    message: "Brands fetched successfully",
    brands,
  });
});

// @ desc   GEt Single Brand
// @route    GET api/v1/brands/:id
// @access   Public
export const getSingleBrandCtrl = asyncHandler(async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    throw new Error("Brands not found");
  } else {
    res.json({
      status: "success",
      message: "Brand fetched successfully",
      brand,
    });
  }
});

// @ desc    Update Brand
// @route    PUT api/v1/brands/:id
// @access   Private/Admin

export const updateBrandCtrl = asyncHandler(async (req, res) => {
  const { name } = req.body;
  // update
  const brand = await Brand.findByIdAndUpdate(
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
    message: "Brand updated successfully",
    brand,
  });
});

// @ desc    Delete Brand
// @route    DELETE api/v1/brands/:id
// @access   Private/Admin

export const deleteBrandCtrl = asyncHandler(async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({
    status: "success",
    message: "Brand deleted successfully",
  });
});
