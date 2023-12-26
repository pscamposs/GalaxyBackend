import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import router from "./router";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

class App {
  private mongoUrl: string;

  public express: express.Application;
  public constructor() {
    dotenv.config();
    this.express = express();
    this.mongoUrl = process.env.MONGO_URL;
    this.database();
    this.middlewares();
    this.routes();
  }

  private middlewares(): void {
    this.express.use(express.json());
    this.express.use(
      cors({
        origin: process.env.CORS_ORIGIN,
        allowedHeaders: "Content-Type, Authorization, Set-Cookie",
        credentials: true,
      })
    );
    this.express.use(cookieParser());
  }

  private database(): void {
    mongoose.Promise = Promise;
    mongoose.connect(this.mongoUrl);
    mongoose.connection.on("error", (error: Error) => console.log(error));
  }

  private routes(): void {
    this.express.use("/", router());
  }
}

export default new App().express;
