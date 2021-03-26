import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import { CallbackError } from 'mongoose';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import passportLocal from 'passport-local';

// import { User, UserType } from '../models/User';
import { User, UserDocument } from '../models/User';

const LocalStrategy = passportLocal.Strategy;

passport.serializeUser((user, done) => {
  // TODO: See if this can be fixed
  // @ts-ignore
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err: CallbackError, user: UserDocument | null) => {
    done(err, user);
  });
});

/**
 * Sign in using Email and Password.
 */
passport.use(
  new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne(
      { email: email.toLowerCase() },
      (err: CallbackError, user: UserDocument | null) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(undefined, false, {
            message: `Email ${email} not found.`,
          });
        }

        user.comparePassword(password, (error: Error, isMatch: boolean) => {
          if (error) {
            return done(error);
          }
          if (isMatch) {
            return done(undefined, user);
          }
          return done(undefined, false, {
            message: 'Invalid email or password.',
          });
        });

        // TODO: Check if this line causes a problem
        return done(undefined, false);
      }
    );
  })
);

passport.use(
  new BasicStrategy((userid, password, done) => {
    User.findOne(
      { email: userid.toLowerCase() },
      (err: Error, user: UserDocument) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false);
        }

        // @ts-ignore
        user.comparePassword(password, (error: Error, isMatch: boolean) => {
          if (error) {
            return done(error);
          }
          if (isMatch) {
            return done(undefined, user);
          }
          // @ts-ignore
          return done(undefined, false, {
            message: 'Invalid email or password.',
          });
        });

        // TODO: Check if this return causes problems
        return done(undefined, false);
      }
    );
  })
);

/**
 * Authorization Required middleware.
 */
const isAuthorized = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const provider = req.path.split('/').slice(-1)[0];

  const user = req.user as UserDocument;
  if (_.find(user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};

export default isAuthorized;
