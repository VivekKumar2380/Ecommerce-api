import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import {
  createOrderCtrl,
  getAllordersCtrl,
  getOrderStatsCtrl,
  getSingleorderCtrl,
  updateOrderCtrl,
} from "../controllers/ordersCtrl.js";
import isAdmin from "../middlewares/isAdmin.js";

const ordersRouter = express.Router();

ordersRouter.post("/", isLoggedIn, createOrderCtrl);
ordersRouter.get("/", isLoggedIn, getAllordersCtrl);
ordersRouter.get("/sales/stats", isLoggedIn, isAdmin, getOrderStatsCtrl);
ordersRouter.get("/:id", isLoggedIn, getSingleorderCtrl);
ordersRouter.put("/update/:id", isLoggedIn, isAdmin, updateOrderCtrl);

export default ordersRouter;
