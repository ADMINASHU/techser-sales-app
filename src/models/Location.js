import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true, // Region names must be unique
        },
        branches: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.models.Location || mongoose.model("Location", LocationSchema);
