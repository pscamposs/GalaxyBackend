import express from "express";
import { login, register, verifyAuth } from "../controllers/authentication";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.get("/auth/verify", isAuthenticated, verifyAuth);
};
