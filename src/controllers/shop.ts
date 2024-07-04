import express from "express";
import { fetchPlugin } from "../db/Plugins";
import { Plugin } from "../helpers/models";
import { createProductPreference } from "../helpers/stripe";
import { initiatePayment, getPaymentById } from "../db/Payment";
import { getUserByEmail, getUserFromSession } from "../db/Users";

export const processPurchase = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart)) {
      return res.status(400).send("Invalid cart data");
    }

    const pluginsToBuy: Plugin[] = await Promise.all(
      cart.map(async (productId) => {
        const plugin = await fetchPlugin(productId);
        return new Plugin(
          plugin?._id,
          plugin?.name,
          plugin?.price,
          1,
          plugin?.image
        );
      })
    );

    if (pluginsToBuy.length === 0) {
      return res.status(500).send("No plugins found");
    }

    const preference = await createProductPreference(pluginsToBuy);

    if (!preference) {
      return res.status(500).send("Failed to create preference");
    }
    let sessionToken = req.cookies["session"];
    const user = await getUserFromSession(sessionToken);

    if (!user) {
      return res.status(401).send("User not authenticated");
    }

    const totalPrice = pluginsToBuy.reduce(
      (acc, plugin) => acc + (plugin.price || 0),
      0
    );

    await initiatePayment({
      checkoutId: preference.id,
      email: user?.email,
      items: pluginsToBuy.map((plugin) => plugin.id),
      price: totalPrice,
      preferenceId: "",
      status: "pending",
    });

    return res.status(200).json(preference);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
};

export const handlePaymentConfirmation = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    let { data } = req.body;
    let { id, payment_intent, payment_status } = data.object;

    let payment = await getPaymentById(id);
    if (!payment) return res.sendStatus(404);

    payment.status = payment_status;
    payment.preferenceId = payment_intent;
    await payment.save();

    if (payment_status == "paid") {
      let user = await getUserByEmail(payment.email).select("+plugins");
      if (!user) return res.sendStatus(401);
      user.plugins?.push(...payment.items);
      await user.save();
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    return res.sendStatus(404);
  }
};
