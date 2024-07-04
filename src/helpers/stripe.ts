import { Plugin } from "./models";
import dotenv from "dotenv";
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_API_KEY);

export const createProduct = async (plugin: Plugin) => {
  stripe.products
    .create({
      id: plugin.id,
      name: plugin.name,
      images: [plugin.image],
    })
    .catch((err) => {
      console.error("Erro ao criar produto:", err);
    })
    .then(async (product) => {
      const price = await stripe.prices.create({
        product: plugin.id,
        unit_amount: Math.round(plugin.price),
        currency: "brl",
      });
    });
};

export const deleteProduct = async (productId: string) => {
  await stripe.products.del(productId);
};

export const editProduct = async (plugin: Plugin) => {
  try {
    await stripe.products.update(plugin.id, {
      name: plugin.name,
      images: [plugin.image],
    });

    const prices = await stripe.prices.list({
      product: plugin.id,
      limit: 1,
    });

    if (prices && prices.data.length > 0) {
      const existingPriceId = prices.data[0].id;

      const updatedPrice = await stripe.prices.create({
        unit_amount: plugin.price,
        currency: "brl",
        product: plugin.id,
      });

      await stripe.products.update(plugin.id, {
        metadata: {
          price_id: updatedPrice.id,
        },
      });

      await stripe.prices.update(existingPriceId, {
        active: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const getProductPrice = async (productId: string) => {
  const prices = await stripe.prices.list({
    product: productId.toString(),
    limit: 1,
  });

  if (prices && prices.data.length > 0) {
    return prices.data[0].id;
  }

  return 0;
};

export const createProductPreference = async (plugins: Plugin[]) => {
  let items = [];

  for (const element of plugins) {
    const plugin = element;
    const price = await getProductPrice(plugin.id);
    items.push({
      price: price,
      quantity: plugin.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: items,
    mode: "payment",
    success_url: "https://galaxystore.pscampos.online/profile/",
    cancel_url: "https://galaxystore.pscampos.online/",
  });

  return session;
};
