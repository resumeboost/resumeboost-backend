import bluebird from 'bluebird';
import compression from 'compression'; // compresses requests
import MongoStore from 'connect-mongo';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import lusca from 'lusca';
import mongoose from 'mongoose';
import passport from 'passport';

import * as userController from './controllers/user';
import logger from './util/logger';
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
    logger.info('MongoDB connected successfully');
  })
  .catch((err) => {
    logger.error(
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
      mongoUrl,
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

/*
 * App Routes
 */
app.post('/login', userController.postLogin);
app.get('/user', userController.getUser);
app.get('/logout', userController.logout);
app.post('/signup', userController.postSignup);
app.post('/user/update/:id', userController.updateUser);

export default app;
