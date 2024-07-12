import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    roles: {
      type: [
        {
          type: String,
        },
      ],
      required: false,
      default: ["USER"],
      select: false,
    },
    plugins: {
      type: [
        {
          type: String,
        },
      ],
      required: false,
      select: false,
    },
    authentication: {
      salt: { type: String, required: true, select: false },
      password: { type: String, required: true, select: false },
      sessionToken: { type: String, select: false },
    },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", UserSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email: string) => UserModel.findOne({ email });
export const getUser = (user: string) =>
  UserModel.findOne().or([
    {
      email: user,
    },
    {
      username: user,
    },
  ]);

export const getUserByUsername = (username: string) =>
  UserModel.findOne({ username });
export const getUserFromSession = (sessionToken: string) =>
  UserModel.findOne({
    "authentication.sessionToken": sessionToken,
  });
export const getUserById = (id: string) => UserModel.findById(id);
export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());
export const deleteById = (id: string) =>
  UserModel.findOneAndDelete({ _id: id });
export const updateUser = (values: Record<string, any>) =>
  UserModel.findOneAndUpdate(values);
