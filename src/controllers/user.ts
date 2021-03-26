import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { User, UserDocument } from "../models/User";
import "../config/passport";

// import mongoose, { Schema, Types, Document } from "mongoose";
// mongoose.set("useFindAndModify", false);
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const unauthorizedHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   data: any
// ) => {
//   res.status(401).send(data);
//   next();
// };

// const errorHandler = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   data: any,
//   error: number
// ) => {
//   res.status(500).send(data);
//   next();
// };

/**
 * Returns all users in the given database
 */
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.find()
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * Will use function to create users for testing purposes. Not in design, purely for testing purposes.
 */
export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const points = Number(req.body.points);
    const targetCompanies = req.body.targetCompanies;
    const targetPositions = req.body.targetPositions;
    const resumes = req.body.resumes;
    const createdAt = req.body.createdAt;

    const newUser = new User({
      email,
      password,
      points,
      targetCompanies,
      targetPositions,
      resumes,
      createdAt,
    });

    newUser
      .save()
      .then(() => res.json("User added to Database!"))
      .catch((err) => res.status(400).json("Error: " + err));
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

export const putResumeActive = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.params.id);
    user.resumes[0].isActive = true;

    user.save().then(() => res.json("Resume was made active"));
  } catch (err) {
    return res.status(400).json("Error: " + err);
  }
};
