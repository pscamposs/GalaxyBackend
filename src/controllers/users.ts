import express from "express";
import { getUserFromSession, getUsers } from "../db/Users";
import { Response } from "../helpers/response";

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users).end();
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send(new Response("error", "Você não possuí permissão"));
  }
};

export const getUserBySession = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let sessionToken = req.cookies["g-auth"];
    let user = await getUserFromSession(sessionToken).select("+roles");

    if (!user)
      return res
        .status(500)
        .send(
          new Response(
            "error",
            "Não foi possível encontrar o usuário requisitado."
          )
        );

    res.cookie("g-auth", sessionToken, {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return res.status(200).send({
      message: "success",
      user,
      timestamp: new Date(),
    });
  } catch (error) {
    return res
      .status(400)
      .send(
        new Response(
          "error",
          "Não foi possível encontrar o usuário requisitado."
        )
      );
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    let sessionToken = req.cookies["g-auth"];
    let user = await getUserFromSession(sessionToken).select("+roles");

    if (!user)
      return res
        .status(500)
        .send(
          new Response(
            "error",
            "Não foi possível encontrar o usuário requisitado."
          )
        );

    res.clearCookie("g-auth");

    return res.redirect("/");
  } catch (error) {
    return res
      .status(400)
      .send(new Response("error", "Você não possuí permissão"));
  }
};
