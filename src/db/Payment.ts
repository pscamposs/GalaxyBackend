import mongoose from "mongoose";
import { getUserByEmail } from "./Users";

const PaymentSchema = new mongoose.Schema({
  checkoutId: { type: String, required: true },
  email: { type: String, required: true },
  preferenceId: { type: String, required: false },
  status: { type: String, required: true },
  price: { type: Number, required: true },
  items: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

export const PaymentModel = mongoose.model("Payment", PaymentSchema);

export const getPaymentById = (checkoutId: string) =>
  PaymentModel.findOne({ checkoutId });

export const getPaymentByUserEmail = (email: string) =>
  PaymentModel.find({ email, status: "paid" });

export const getPayments = () => PaymentModel.find();

export const getPaymentsByStatus = (status: string) =>
  PaymentModel.find({ status });

export const getPaymentsRanking = async () => {
  let payments = await getPayments();
  let totals = {};
  let userCreatedAt = {};

  for (let payment of payments as any) {
    let user = await getUserByEmail(payment.email).select("+createdAt");

    if (totals[user.username]) {
      totals[user.username] += payment.price;
    } else {
      totals[user.username] = payment.price;
      userCreatedAt[user.username] = user.createdAt;
    }
  }

  let ranking = Object.entries(totals).map(([username, total]) => ({
    username,
    total,
    createdAt: userCreatedAt[username], // Inclui a data de criação do usuário no ranking
  }));
  ranking.sort((a, b) => b.total - a.total);

  return ranking;
};

export const initiatePayment = (values: Record<string, any>) =>
  new PaymentModel(values).save().then((plugin) => plugin.toObject());
