import mongoose from "mongoose";

const ReleaseSchema = new mongoose.Schema(
  {
    version: {
      type: String,
      required: true,
      unique: true, // e.g., "1.0.1"
    },
    downloadUrl: {
      type: String,
      required: true,
    },
    releaseNotes: {
      type: [String], // Array of strings for bullet points
      default: [],
    },
    forceUpdate: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Release ||
  mongoose.model("Release", ReleaseSchema);
