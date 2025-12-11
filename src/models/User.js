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
        resetToken: String,
        resetTokenExpiry: Date,
        provider: {
            type: String,
            default: "credentials",
        },
    },
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
