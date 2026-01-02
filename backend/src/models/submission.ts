import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  language: string;
  code: string;
  verdict: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded"|"Pending";
  createdAt: Date;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript"],
    },
    code: {
      type: String,
      required: true,
    },
    verdict: {
      type: String,
      required: true,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Runtime Error",
        "Time Limit Exceeded",
        "Pending",
      ],
    },
  },
  { timestamps: true }
);

const Submission = mongoose.model<ISubmission>(
  "Submission",
  submissionSchema
);

export default Submission;
