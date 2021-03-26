import mongoose from "mongoose";

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
  createdAt: Date;
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

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  points: Number,
  targetCompanies: [Employer],
  targetPositions: [String],
  resumes: [Resume],
  createdAt: Date,
});

export const User = mongoose.model<UserDocument>("User", userSchema);
