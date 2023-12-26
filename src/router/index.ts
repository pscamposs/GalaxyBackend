import express from "express";
import authentication from "./authentication";
import users from "./users";
import plugins from "./plugins";
import { shop } from "./shop";
import admin from "./admin";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  users(router);
  plugins(router);
  shop(router);
  admin(router);
  return router;
};
