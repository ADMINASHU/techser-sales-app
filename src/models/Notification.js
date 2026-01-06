import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        body: {
            type: String,
            required: true
        },
        data: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        read: {
            type: Boolean,
            default: false,
            index: true
        },
        link: String,
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info"
        }
    },
    { timestamps: true }
);

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

if (process.env.NODE_ENV === "development") {
    if (mongoose.models.Notification) {
        delete mongoose.models.Notification;
    }
}

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
