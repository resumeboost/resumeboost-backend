import passport from "passport";
import { User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { check, sanitize, validationResult } from "express-validator";
import "../config/passport";
import S3 from "aws-sdk/clients/s3";
import { AWS_BUCKET_NAME, AWS_ID, AWS_SECRET } from "../util/secrets";
import { v4 as uuidv4 } from "uuid";
import { uploadToS3 } from "./api";

import mongoose from "mongoose";
mongoose.set("useFindAndModify", false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unauthorizedHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  data: any
) => {
  res.status(401).send(data);
  next();
};

const errorHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
  data: any,
  error: number
) => {
  res.status(500).send(data);
  next();
};

// TODO: fixed this to make linter work but we
// need to figure out where this is used and make it work
const extractUserData = (user: UserDocument) => {
  const _id = user._id;
  const email = user.email;
  const points = user.points;
  return { _id, email, points };
  //const { _id, name, email, phoneNumber, address, type } = user;
  //return { _id, name, email, phoneNumber, address, type };
};

const s3 = new S3({
  accessKeyId: AWS_ID,
  secretAccessKey: AWS_SECRET,
});

/**
 * Sign in using email and password.
 * @route POST /login
 */
export const postLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO Run validations on frontend too
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password cannot be blank")
    .isLength({ min: 1 })
    .run(req);
  await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Validation errors
    // @ts-ignore
    return unauthorizedHandler(req, res, next, errors.errors[0].msg);
  }

  passport.authenticate(
    "local",
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        console.log("errors");
        return unauthorizedHandler(req, res, next, err);
      }
      if (!user) {
        console.log("User");
        return unauthorizedHandler(req, res, next, info.message);
      }

      req.logIn(user, (err) => {
        if (err) {
          console.log("Login error");
          return unauthorizedHandler(req, res, next, err);
        }
        console.log("Success! You are logged in.");
        console.log("user");
        console.log(user);
        res.send(extractUserData(user));
      });
    }
  )(req, res, next);
};

/**
 * API Auth middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Authenticating...");

  passport.authenticate(
    "local",
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return unauthorizedHandler(req, res, next, err);
      }
      if (!user) {
        return unauthorizedHandler(req, res, next, info.message);
      }
      console.log("Auth successful");
      next();
    }
  )(req, res, next);
};

export const getUser = (req: Request, res: Response) => {
  console.log("Called getuser");
  let userData;
  const user = req.user as UserDocument;

  if (user && user !== undefined) {
    userData = extractUserData(user);
  }

  res.send(userData); // The req.user stores the entire user that has been authenticated inside of it.
};

/**
 * Log out.
 * @route GET /logout
 */
export const logout = (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) return next(err);

    req.logout();

    res.sendStatus(200);
  });
  // TODO: Fix
  // req.logout();
};

/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await check("email", "Email is not valid").isEmail().run(req);
  await check("password", "Password must be at least 4 characters long")
    .isLength({ min: 4 })
    .run(req);
  // await check("confirm", "Passwords do not match")
  //   .equals(req.body.password)
  //   .run(req);

  await sanitize("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Validation errors
    // @ts-ignore
    return unauthorizedHandler(req, res, next, errors.errors[0].msg);
  }
  const email = req.body.email;
  const password = req.body.password;
  const points = Number(req.body.points);
  const targetCompanies = req.body.targetCompanies;
  const targetPositions = req.body.targetPositions;
  const resumes = req.body.resumes;
  const createdAt = req.body.createdAt;

  const user = new User({
    email,
    password,
    points,
    targetCompanies,
    targetPositions,
    resumes,
    createdAt,
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (err) {
      return errorHandler(req, res, next, err, 400);
    }
    if (existingUser) {
      return errorHandler(
        req,
        res,
        next,
        "Account with that email address already exists.",
        400
      );
    }
    user.save((error) => {
      if (error) {
        return errorHandler(req, res, next, error, 500);
      }
      req.logIn(user, (errorLogin) => {
        if (errorLogin) {
          return errorHandler(req, res, next, errorLogin, 500);
        }
        console.log("Success! You are signed up");
        console.log("user");
        console.log(user);
        res.send(extractUserData(user));
      });
    });
  });
};

/**
 * Function that can update user information in the database
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.findOneAndUpdate(
    { _id: req.params.id },
    { $set: req.body },
    { new: true }
  )
    .then((user) => {
      res.json(user);
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * Returns all users in the given database
 */
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  User.find()
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * For this version, we are assuming every user has only one resume
 */
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

/**
 * Function that can update user resume information in the database
 */
export const updateUserResume = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("called updateUserResume");
  const myFile = req.file.originalname.split(".");
  const fileType = myFile[myFile.length - 1];
  const filename = uuidv4() + "." + fileType;
  const imgUrl = await uploadToS3(req, filename);

  const user = await User.findById(req.params.id);
  user.resumes[0].link = filename;
  user.resumes[0].isActive = true;
  const now = new Date();
  user.resumes[0].createdAt = now;
  user
    .save()
    .then((user) => {
      res.json("User has been updated successfully!");
    })
    .catch((err) => res.status(400).json("Error: " + err));
};

/**
 * Will use function to create users for testing purposes. Not in design document, purely for testing purposes.
 */
//  export const addUser = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const email = req.body.email;
//     const password = req.body.password;
//     const points = Number(req.body.points);
//     const targetCompanies = req.body.targetCompanies;
//     const targetPositions = req.body.targetPositions;
//     const resumes = req.body.resumes;
//     const createdAt = req.body.createdAt;

//     const newUser = new User({
//       email,
//       password,
//       points,
//       targetCompanies,
//       targetPositions,
//       resumes,
//       createdAt,
//     });

//     newUser
//       .save()
//       .then(() => res.json("User added to Database!"))
//       .catch((err) => res.status(400).json("Error: " + err));
//   } catch (e) {
//     console.log(e);
//     res.status(500).json(e);
//   }
// };
