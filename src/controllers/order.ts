import { Order } from "../models/Order";
import { Request, Response, NextFunction } from "express";
import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from "uuid";

import "../config/passport";

const path = require("path");

const createReceiptPdf = async (
  req: Request,
  orderId: string,
  transactionId: string
) => {
  const filename = orderId + ".pdf";
  // const pathname = path.join(__dirname, "receipts", filename);
  const pathname = filename;

  const doc = new jsPDF();
  const titleContent = "order receipt\n";
  const orderIdContent = "order id: " + orderId + "\n";
  const transactionIdContent = "transaction id: " + transactionId + "\n";
  const orderContent = JSON.stringify(req.body, null, 2);

  const content = titleContent.concat(
    orderIdContent,
    transactionIdContent,
    orderContent
  );

  doc.text(content, 10, 10);
  doc.save(pathname);
  return pathname;
};

const createSummaryPdf = async (
  startTime: Date,
  endTime: Date,
  orders: any
) => {
  const pathname = path.join(__dirname, uuidv4() + ".pdf");
  const doc = new jsPDF();

  const titleContent = "summary\n";
  const timesContent =
    "Start time: " + startTime + "; End time: " + endTime + "\n";
  const ordersContent = orders.toString();

  const content = titleContent.concat(timesContent, ordersContent);

  doc.text(content, 10, 10);
  doc.save(pathname);

  return pathname;
};

export const postOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const transactionID = "dummy_transaction_id";

  const newOrder = new Order({
    email: req.body.email,
    name: req.body.name,
    readyTime: null,
    pickupTime: req.body.pickupTime,
    carDescription: req.body.carDescription,
    items: req.body.items,
    subTotal: req.body.subTotal,
    taxAmount: req.body.taxAmount,
    totalPrice: req.body.totalPrice,
    receipt: null,
    transactionID: transactionID,
  });

  try {
    const receiptPath = await createReceiptPdf(
      req,
      newOrder._id,
      transactionID
    );
    newOrder.receipt = receiptPath;
    newOrder.markModified("receipt");
    await newOrder.save();
    res.download(receiptPath);
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
};

export const getOrderOutstanding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ readyTime: null });
    return res.json(orders);
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
};

export const putOrderOutstandingById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (order.readyTime) {
        throw "order already completed";
      }
      order.readyTime = new Date();
      order.markModified("readyTime");
      await order.save();
      return res.json("Successful updated readyTime");
    } else {
      throw "unknown order id";
    }
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
};

export const getOrderSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);

  try {
    const orders = await Order.find(
      { createdAt: { $gte: startDate, $lt: endDate } },
      { "items._id": { $elemMatch: { $in: "$req.body.ids" } } }
    );
    const path = await createSummaryPdf(startDate, endDate, orders);
    res.download(path);
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
};
