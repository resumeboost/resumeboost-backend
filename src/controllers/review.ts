import { Request, Response, NextFunction } from "express";
import { Review } from "../models/Review";
import { User } from "../models/User";

const adjustRevieweePoints = (
  reviewee_points
) => {
  return reviewee_points - 1;
}

const adjustReviewerPoints = (
  reviewer_points
) => {
  return reviewer_points + 1;
}

// This endpoint is responsible for a few things
// First, it should create 
export const postReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reviewee_id = req.body.reviewee_id;
  const reviewer_id = req.body.reviewer_id;

  const newReview = new Review({
    reviewee_id: req.body.reviewee_id,
    reviewer_id: req.body.reviewer_id,
    resume_id: req.body.resume_id,
    info: req.body.info,
  });

  try {
    const reviewee = await User.findById(reviewee_id);
    const reviewer = await User.findById(reviewer_id);
    
    reviewee.points = adjustRevieweePoints(reviewee.points);
    reviewer.points = adjustReviewerPoints(reviewer.points);

    // need to make these three operations atomic
    await newReview.save();
    await reviewee.save();
    await reviewer.save();

  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
}