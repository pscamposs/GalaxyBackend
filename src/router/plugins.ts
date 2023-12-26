import express from "express";
import {
  deletePlugin,
  downloadPlugin,
  getAllPlugin,
  getUserPlugins,
  registerPlugin,
  updatePlugin,
  getPluginWithCategory,
  getUserPluginsWithCategory,
} from "../controllers/plugins";

import multer from "multer";
import { hasRole, isAuthenticated } from "../middlewares";
const upload = multer({ dest: "uploads/" });

export default (router: express.Router) => {
  router.post("/plugin", upload.single("file"), registerPlugin);
  router.post("/plugins", getAllPlugin);
  router.post("/plugins/:category", getPluginWithCategory);

  router.post("/user/plugins", isAuthenticated, getUserPlugins);
  router.post("/user/:category", isAuthenticated, getUserPluginsWithCategory);

  router.delete("/plugin/:id", hasRole(["ADMIN"]), deletePlugin);
  router.put("/plugin/:id", hasRole(["ADMIN"]), updatePlugin);
  router.get("/plugin/:id", downloadPlugin);
};
