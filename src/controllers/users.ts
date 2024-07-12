import express from "express";
import { getUserFromSession, getUsers } from "../db/Users";
import { Response } from "../helpers/response";
import {
  getPaymentByUserEmail,
  getPaymentsByStatus,
  getPaymentsRanking,
} from "../db/Payment";

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
    let sessionToken = req.headers.authorization;

    let user = await getUserFromSession(sessionToken as string).select(
      "+roles +plugins"
    );

    if (!user)
      return res
        .status(500)
        .send(
          new Response(
            "error",
            "Não foi possível encontrar o usuário requisitado."
          )
        );

    let payments = await getPaymentByUserEmail(user.email);
    let totalSpent = payments.reduce(
      (payment, acc) => payment.price + acc.price,
      0
    );
    let clientRanking = await getPaymentsRanking();

    const { ...userData } = user.toObject();

    return res.status(200).send({
      message: "success",
      profile: {
        ...userData,
        totalSpent,
        credits: 0,
        tickets: 0,
      },
      clientRanking,
      timestamp: new Date(),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send(
        new Response("error", "Erro interno, consulte os administradores.")
      );
  }
};
