import bcrypt from "bcrypt-nodejs";
import mongoose, { Document } from "mongoose";

export interface AuthToken {
  accessToken: string;
  kind: string;
}

type comparePasswordFunction = (
  candidatePassword: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cb: (err: any, isMatch: any) => {}
) => void;

interface Employer {
  name: string;
  industries: string[];
  logo: string;
}

interface Resume {
  link: string;
  createdAt: Date;
  isActive: boolean;
}

export type UserDocument = mongoose.Document & {
  email: string;
  password: string;
  points: number;
  targetCompanies: Employer[];
  targetPositions: string[];
  resumes: Resume[];
  tokens: AuthToken[];
  comparePassword: comparePasswordFunction;
};

const Employer = new mongoose.Schema({
  name: String,
  industries: [String],
  logo: String,
});

const Resume = new mongoose.Schema({
  link: String,
  createdAt: Date,
  isActive: Boolean,
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    password: String,
    points: Number,
    targetCompanies: [Employer],
    targetPositions: [String],
    resumes: [Resume],
    createdAt: Date,
  },
  { timestamps: true }
);

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, undefined, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

const comparePassword: comparePasswordFunction = function (
  candidatePassword,
  cb
) {
  bcrypt.compare(
    candidatePassword,
    this.password,
    (err: mongoose.Error, isMatch: boolean) => {
      cb(err, isMatch);
    }
  );
};

userSchema.methods.comparePassword = comparePassword;

export const User = mongoose.model<UserDocument>("User", userSchema);
