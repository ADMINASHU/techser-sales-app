import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
            maxlength: [60, "Name cannot be more than 60 characters"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            select: false, // Don't return password by default
        },
        image: {
            type: String,
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["pending", "verified", "declined"],
            default: "pending",
        },
        contactNumber: String,
        address: String,
        region: String,
        branch: String,
        designation: String,
        resetToken: String,
        resetTokenExpiry: Date,
        provider: {
            type: String,
            default: "credentials",
        },
        fcmTokens: {
            type: [String], // Array to support multiple devices
            default: [],
        },
    },
    { timestamps: true }
);

// Add index for faster sorting by creation date
UserSchema.index({ createdAt: -1 });
UserSchema.index({ role: 1, region: 1 }); // Optimize admin lookup by region

export default mongoose.models.User || mongoose.model("User", UserSchema);
