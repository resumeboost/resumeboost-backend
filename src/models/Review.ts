import mongoose from "mongoose";

interface ReviewInfo {
  visual: number,
  content: number,
  relevance: number,
  feedback: string,
}

export type ReviewDocument = mongoose.Document & {
  reviewee_id: string,
  reviewer_id: string,
  resume_id: string,
  info: ReviewInfo,
}

const reviewSchema = new mongoose.Schema(
  {
    reviewee_id: String,
    reviewer_id: String,
    resume_id: String,
    info: {
      visual: Number,
      content: Number,
      relevance: Number,
      feedback: String,
    }
  }
);

export const Review = mongoose.model<ReviewDocument>("Review", reviewSchema);
