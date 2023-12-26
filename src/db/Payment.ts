import mongoose from "mongoose";

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
  PaymentModel.findOne({ email });

export const getPayments = () => PaymentModel.find();

export const getPaymentsByStatus = (status: string) =>
  PaymentModel.find({ status });

export const initiatePayment = (values: Record<string, any>) =>
  new PaymentModel(values).save().then((plugin) => plugin.toObject());
