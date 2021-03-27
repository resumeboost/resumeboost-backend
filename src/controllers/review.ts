import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { User, UserDocument } from "../models/User";
import { downloadFromS3 } from "./api";

const adjustRevieweePoints = (reviewee_points) => {
  return reviewee_points - 1;
};

const adjustReviewerPoints = (reviewer_points) => {
  return reviewer_points + 1;
};

// This endpoint is responsible for a few things
// First, it should create
export const postReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const revieweeId = req.body.revieweeId;
  const reviewerId = req.body.reviewerId;

  const newReview = new Review({
    revieweeId: req.body.revieweeId,
    reviewerId: req.body.reviewerId,
    resumeId: req.body.resumeId,
    info: req.body.info,
  });

  try {
    const reviewee = await User.findById(revieweeId);
    if (!reviewee) {
      throw "Invalid reviewee id";
    }

    const reviewer = await User.findById(reviewerId);
    if (!reviewer) {
      throw "Invalid reviewer id";
    }

    reviewee.points = adjustRevieweePoints(reviewee.points);
    reviewer.points = adjustReviewerPoints(reviewer.points);

    // need to make these three operations atomic
    await newReview.save();
    await reviewee.save();
    await reviewer.save();

    return res.status(200).json("points: " + reviewer.points);
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
};

const selectTargetUser = (req: Request, users: UserDocument[]) => {
  const currentUser = req.user as UserDocument;
  const currentUserId = currentUser._id;

  if (!users) {
    throw "invalid db query";
  }

  if (users.length == 0) {
    throw "no users with active resumes";
  }

  if (users.length == 1 && users[0]._id == currentUserId) {
    throw "current user is the only one with active resume";
  }

  let randIdx = Math.floor(Math.random() * users.length);
  let proposedUser = users[randIdx];
  while (proposedUser._id == currentUserId) {
    randIdx = Math.floor(Math.random() * users.length);
    proposedUser = users[randIdx];
  }

  return proposedUser;
};

const selectActiveResume = (targetUser: UserDocument) => {
  // select one of the active resumes
  // from this user
  // TODO: don't get the first one always

  for (let i = 0; i < targetUser.resumes.length; i++) {
    if (targetUser.resumes[i].isActive) {
      return targetUser.resumes[i].link;
    }
  }

  throw "target user did not have active resume";
};

export const getNextReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // first, search for any resume that is available for review
    const users = await User.find({
      "resumes.isActive": true,
    });

    const targetUser = selectTargetUser(req, users);
    const targetResume = selectActiveResume(targetUser);
    // now, download the resume from the storage service
    const path = await downloadFromS3(targetResume);
    return res
      .status(200)
      .json("revieweeId: " + targetUser._id)
      .download(path);
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
};
