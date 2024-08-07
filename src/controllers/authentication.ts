import { authentication } from "./../helpers/index";
import express from "express";
import {
  UserModel,
  createUser,
  getUser,
  getUserByEmail,
  getUserByUsername,
} from "../db/Users";
import { random } from "../helpers";
import { AuthResponse, Response } from "../helpers/response";
import { getPaymentByUserEmail } from "../db/Payment";

export const login = async (req: express.Request, res: express.Response) => {
  console.log(req.body);
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.sendStatus(400);
    }

    const user = await getUser(username).select(
      "+authentication.password +authentication.salt +roles"
    );

    if (!user) {
      return res
        .status(404)
        .send(new Response("error", "Usuário não cadastrado."));
    }

    const expectedHash = authentication(user.authentication?.salt, password);
    if (user.authentication?.password !== expectedHash) {
      return res
        .status(400)
        .send(
          new Response("error", "Credenciais incorretas, tente novamente.")
        );
    }

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );
    await user.save();

    const { email, roles } = user.toObject();
    let payments = await getPaymentByUserEmail(user.email);
    let totalSpent = payments.reduce(
      (payment, acc) => payment.price + acc.price,
      0
    );
    let responseR = {
      message: "success",
      profile: {
        accessToken: user.authentication.sessionToken,
        username,
        email,
        roles,
      },
      timestamp: new Date(),
    };
    console.log(responseR);

    return res.status(200).send(responseR);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const verifyAuth = async (
  req: express.Request,
  res: express.Response
) => {
  return res.sendStatus(200);
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, username, password } = req.body;
    if (!email || !username || !password) {
      return res.sendStatus(400);
    }

    const existingUser =
      (await getUserByEmail(email)) ?? (await getUserByUsername(username));
    if (existingUser) {
      return res
        .status(400)
        .send(new Response("error", "Usuario ou email já cadastrados."));
    }

    const salt = random();
    await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res
      .status(200)
      .send(new Response("success", "Usuário cadastrado com sucesso."))
      .end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
