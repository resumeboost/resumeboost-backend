import { NextFunction, Request, Response } from "express";
import _ from "lodash";
import passport from "passport";
import { BasicStrategy } from "passport-http";
import passportLocal from "passport-local";

// import { User, UserType } from '../models/User';
import { User, UserDocument } from "../models/User";

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, {
          message: "Invalid email or password.",
        });
      });
    });
  })
);

passport.use(
  new BasicStrategy((userid, password, done) => {
    console.log("Inside Basic Auth");
    User.findOne({ email: userid.toLowerCase() }, function (err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false);
      }

      // @ts-ignore
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        // @ts-ignore
        return done(undefined, false, {
          message: "Invalid email or password.",
        });
      });
    });
  })
);

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const provider = req.path.split("/").slice(-1)[0];

  const user = req.user as UserDocument;
  if (_.find(user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
