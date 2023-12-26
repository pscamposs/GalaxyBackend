import e from "express";
import {
  processPurchase,
  handlePaymentConfirmation,
} from "../controllers/shop";
import { isAuthenticated } from "../middlewares";

export const shop = (router: e.Router) => {
  router.post("/api/purchase", isAuthenticated, processPurchase);
  router.post("/api/checkout", handlePaymentConfirmation);
};
