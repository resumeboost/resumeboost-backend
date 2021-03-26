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
  const reviewee_id = req.body.revieweeId;
  const reviewer_id = req.body.reviewerId;

  const newReview = new Review({
    revieweeId: req.body.revieweeId,
    reviewerId: req.body.reviewerId,
    resumeId: req.body.resumeId,
    info: req.body.info,
  });

  try {
    const reviewee = await User.findById(reviewee_id);
    const reviewer = await User.findById(reviewer_id);

    reviewee.points = adjustRevieweePoints(reviewee.points);
    reviewer.points = adjustReviewerPoints(reviewer.points);

    // need to make these three operations atomic
    newReview
      .save()
      .then(() => res.json("Thanks for the review"))
      .catch((err) => res.status(400).json("Error: " + err));
    reviewee.save();
    reviewer.save();
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
};

/**
 * This method returns all the reviews made by a particular user
 */
export const getReviewsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    Review.find({ revieweeId: req.params.id })
      .then((review) => {
        res.json(review);
      })
      .catch((err) => res.status(400).json("Error: " + err));
  } catch (err) {
    console.log(err);
    return res.status(400).json("Error: " + err);
  }
};

/**
 * Returns all reviews in the given database. 
 */
export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Review.find()
    .then((review) => res.json(review))
    .catch((err) => res.status(400).json("Error: " + err));
};
