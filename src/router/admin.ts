import express from "express";
import { fetchGeneralData } from "../controllers/admin";
import { hasRole } from "../middlewares";

export default (router: express.Router) => {
  router.get("/admin/general", hasRole(["ADMIN"]), fetchGeneralData);
};
