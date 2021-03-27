import mongoose from "mongoose";

interface ReviewInfo {
  visual: number;
  content: number;
  relevance: number;
  feedback: string;
}

export type ReviewDocument = mongoose.Document & {
  revieweeId: string;
  reviewerId: string;
  resumeId: string;
  info: ReviewInfo;
};

const reviewSchema = new mongoose.Schema(
  {
    revieweeId: String,
    reviewerId: String,
    resumeId: String,
    info: {
      visual: Number,
      content: Number,
      relevance: Number,
      feedback: String,
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model<ReviewDocument>("Review", reviewSchema);
