import { Menu, MenuDocument } from "../models/Menu";
import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import "../config/passport";
import { uploadToS3 } from "./api";

const router = require("express").Router();

/**
 * Function that gets all Items in Menu Database
 */
export const getMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Menu.find()
    .then((menu) => res.json(menu))
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * Function that gets all Items in Menu Database with a paerticular ID
 */
export const getMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Menu.findById(req.params.id)
    .then((menu) => res.json(menu))
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * Function that can add items to the Menu Database
 */
export const addMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const myFile = req.file.originalname.split(".");

    const fileType = myFile[myFile.length - 1];
    const filename = uuidv4() + "." + fileType;

    const imgUrl = await uploadToS3(req, filename);

    const name = req.body.name;
    const picture = imgUrl;
    const price = Number(req.body.price);
    const available = req.body.available;

    const newMenuItem = new Menu({
      name,
      picture,
      price,
      available,
    });

    newMenuItem
      .save()
      .then(() => res.json("Item added to Menu!"))
      .catch((err) => res.status(400).json("Error: " + err));
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

/**
 * Function that can update any Item in the Menu Database
 */
export const updateMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const updatedItem: MenuDocument = req.body;

    if (req.file) {
      const myFile = req.file.originalname.split(".");
      const fileType = myFile[myFile.length - 1];
      const filename = uuidv4() + "." + fileType;
      updatedItem.picture = await uploadToS3(req, filename);
    }

    Menu.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedItem },
      { new: true }
    )
      .then((newItem) => res.json(newItem))
      .catch((err) => res.status(400).json("Error: " + err));
  } catch (err) {
    res.status(400).json("Error: " + err);
  }
};

/**
 * Function that can delete any Item in the Menu Database
 */
export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Menu.findByIdAndDelete(req.params.id)
    .then(() => res.json("Menu Item deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
};
