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
  router.post(
    "/plugin",
    hasRole(["ADMIN"]),
    upload.single("file"),
    registerPlugin
  );
  router.post("/plugins", getAllPlugin);
  router.post("/plugins/:category", getPluginWithCategory);

  router.post("/user/plugins", isAuthenticated, getUserPlugins);
  router.post("/user/:category", isAuthenticated, getUserPluginsWithCategory);

  router.delete("/plugin/:id", deletePlugin);
  router.put("/plugin/:id", updatePlugin);
  router.get("/plugin/:id", downloadPlugin);
};
