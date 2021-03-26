import mongoose from "mongoose";

interface Item {
  _id: string;
  name: string;
  picture: string;
  price: number;
  quantity: number;
}

export type OrderDocument = mongoose.Document & {
  email: string;
  name: string;
  readyTime: Date;
  pickupTime: Date;
  carDescription: string;
  items: Item[];
  subTotal: number;
  taxAmount: number;
  totalPrice: number;
  receipt: string;
  transactionID: string;
};

const orderSchema = new mongoose.Schema(
  {
    email: String,
    name: String,
    readyTime: Date,
    pickupTime: Date,
    carDescription: String,
    items: [
      {
        _id: String,
        name: String,
        picture: String,
        price: Number,
        quantity: Number,
      },
    ],
    subTotal: Number,
    taxAmount: Number,
    totalPrice: Number,
    receipt: String,
    transactionID: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<OrderDocument>("Order", orderSchema);
