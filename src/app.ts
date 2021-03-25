import bluebird from 'bluebird';
import compression from 'compression'; // compresses requests
import MongoStore from 'connect-mongo';
import cors from 'cors';
import express, { Request, Response } from 'express';
import session from 'express-session';
import lusca from 'lusca';
import mongoose from 'mongoose';
import multer from 'multer';
import passport from 'passport';

import { MONGODB_URI, SESSION_SECRET } from './util/secrets';

// const MongoStore = mongo(session);

// Create Express server
const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;

mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`
    );
    // process.exit();
  });

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(compression());
app.use(express.json());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: MongoStore.create({
      mongoUrl: mongoUrl,
      // autoReconnect: true,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) ||
    (req.user && req.path == '/account')
  ) {
    // @ts-ignore
    req.session.returnTo = req.path;
  }
  // else if (req.user && req.path == "/account") {
  //   // @ts-ignore
  //   req.session.returnTo = req.path;
  // }
  next();
});

app.get('/', (req, res, next) => {
  res.send('Hello');
});

export default app;
