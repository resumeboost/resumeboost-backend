import mongoose from "mongoose";

export type MenuDocument = mongoose.Document & {
  name: string;
  picture: string;
  price: number;
  available: boolean;
};

const menuSchema = new mongoose.Schema(
  {
    name: String,
    picture: String,
    price: Number,
    available: Boolean,
  },
  { timestamps: true }
);

export const Menu = mongoose.model<MenuDocument>("Menu", menuSchema);
