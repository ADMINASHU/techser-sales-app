import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            enum: ["regions", "branches"],
        },
        values: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
