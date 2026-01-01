import mongoose from "mongoose";

const SystemSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
        },
        value: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    },
    { timestamps: true }
);

// Prevent model overwrite in development
if (process.env.NODE_ENV !== "production" && mongoose.models.SystemSetting) {
    delete mongoose.models.SystemSetting;
}

export default mongoose.models.SystemSetting || mongoose.model("SystemSetting", SystemSettingSchema);
