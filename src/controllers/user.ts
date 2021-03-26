import '../config/passport';

import { NextFunction, Request, Response } from 'express';
import { check, sanitize, validationResult } from 'express-validator';
import mongoose from 'mongoose';
// import nodemailer from 'nodemailer';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';

import { User, UserDocument } from '../models/User';

mongoose.set('useFindAndModify', false);
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
  res.status(error).send(data);
  next();
};

const extractUserData = (user: UserDocument) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { _id, name, email, phoneNumber, address, type } = user;

  return { _id, name, email, phoneNumber, address, type };
};

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
  await check('email', 'Email is not valid').isEmail().run(req);
  await check('password', 'Password cannot be blank')
    .isLength({ min: 1 })
    .run(req);
  await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Validation errors
    // @ts-ignore
    return unauthorizedHandler(req, res, next, errors.errors[0].msg);
  }

  passport.authenticate(
    'local',
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return unauthorizedHandler(req, res, next, err);
      }
      if (!user) {
        return unauthorizedHandler(req, res, next, info?.message);
      }

      req.logIn(user, (error) => {
        if (error) {
          return unauthorizedHandler(req, res, next, error);
        }
        res.send(extractUserData(user));
        return next();
      });

      // TODO: Check if return breaks anything
      return next();
    }
  )(req, res, next);

  return next();
};

/**
 * API Auth middleware.
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    'local',
    (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) {
        return unauthorizedHandler(req, res, next, err);
      }
      if (!user) {
        return unauthorizedHandler(req, res, next, info.message);
      }
      return next();
    }
  )(req, res, next);
};

export const getUser = (req: Request, res: Response) => {
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
    return next();
  });
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
  await check('email', 'Email is not valid').isEmail().run(req);
  await check('password', 'Password must be at least 4 characters long')
    .isLength({ min: 4 })
    .run(req);
  // await check("confirm", "Passwords do not match")
  //   .equals(req.body.password)
  //   .run(req);

  await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Validation errors
    // @ts-ignore
    return unauthorizedHandler(req, res, next, errors.errors[0].msg);
  }

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    type: req.body.type,
  });

  try {
    const existingUser = await User.findOne({ email: req.body.email }).exec();
    if (existingUser) {
      return errorHandler(
        req,
        res,
        next,
        'Account with that email address already exists.',
        400
      );
    }

    await user.save();

    req.logIn(user, (errorLogin) => {
      if (errorLogin) {
        return errorHandler(req, res, next, errorLogin, 500);
      }
      res.send(extractUserData(user));
      return next();
    });
  } catch (err) {
    return errorHandler(req, res, next, err, 500);
  }

  return next();
};

/**
 * Function that can update user information in the database
 */
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).exec();
    res.json(user);
  } catch (err) {
    res.status(400).json(err);
  }

  return next();
};
