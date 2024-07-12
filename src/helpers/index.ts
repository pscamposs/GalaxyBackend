import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
const SECRET = process.env.JWT_SECRET as string;
export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (salt: string | undefined, password: string) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};
