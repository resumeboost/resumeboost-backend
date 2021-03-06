import bluebird from "bluebird";
import bodyParser from "body-parser";
import compression from "compression"; // compresses requests
import mongo from "connect-mongo";
import cors from "cors";
import express from "express";
import flash from "express-flash";
import session from "express-session";
import lusca from "lusca";
import mongoose from "mongoose";
import multer from "multer";
import passport from "passport";
import path from "path";

import * as api from "./controllers/api";
import * as imageController from "./controllers/image";
import * as reviewController from "./controllers/review";
// Controllers (route handlers)
import * as userController from "./controllers/user";
//New comment
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Create Express server
const app = express();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

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
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`
    );
    // process.exit();
  });

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (
    (!req.user &&
      req.path !== "/login" &&
      req.path !== "/signup" &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) ||
    (req.user && req.path == "/account")
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

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    console.log("reached file filter");
    if (file.mimetype == "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .pdf file format allowed!"));
    }
  },
  limits: { fileSize: 3 * 1024 * 1024 },
}).single("file"); //file is the key, and key is needed whenever the file is uploaded

/*
 * Primary app routes.
 */
app.post("/login", userController.postLogin);
app.get("/user", userController.getUser);

app.get("/logout", userController.logout);
app.post("/signup", userController.postSignup);
app.post("/user/update/:id", userController.updateUser);
// app.put("/addUser", userController.addUser);
app.put("/resume/:id/active", userController.putResumeActive);
app.put("/user/:id/resume", upload, userController.updateUserResume);

app.put("/review", reviewController.postReview);
app.get("/review/:id", reviewController.getReviewsByUser);
app.get("/getreview", reviewController.getAllReviews);

//Test endpoint
app.get("/getresume", async (req, res, next) => {
  const ret = await api.downloadFromS3(
    req,
    "c6250edb-8c9b-45a9-85bd-2843de48a519.pdf"
  );
  res.json({ fileData: ret });
});

app.post("/image", imageController.postImage);

app.post("/review", reviewController.postReview);
app.get("/review/next", reviewController.getNextReview);
/**
 * API examples routes.
 */
// app.post(
//   "/api/odometer",
//   passport.authenticate("basic", { session: false }),
//   upload,
//   apiController.getOdometerReading
// );
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

export default app;
