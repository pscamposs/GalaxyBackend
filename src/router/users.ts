import express from "express";
import { getAllUsers, getUserBySession, logout } from "../controllers/users";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/users", isAuthenticated, getAllUsers);
  router.get("/user/profile", isAuthenticated, getUserBySession);
  router.post("/auth/logout", isAuthenticated, logout);
};
