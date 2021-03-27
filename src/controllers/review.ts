import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { User } from "../models/User";

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

/*
export const getNextReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

};
*/
