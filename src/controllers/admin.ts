import { PaymentModel, getPaymentsByStatus } from "./../db/Payment";
import express from "express";
import { fetchPlugins } from "../db/Plugins";
import { getUsers } from "../db/Users";
import { getPayments } from "../db/Payment";

export const fetchGeneralData = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let plugins = await fetchPlugins();
    let users = await getUsers();
    let payments = await getPaymentsByStatus("paid");
    let totalSales = payments.reduce((acc, e) => acc + e.price, 0);
    let data = {
      users: users.length,
      plugins: plugins.length,
      payments: payments.length,
      totalSales,
    };

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
