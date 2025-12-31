import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        customerAddress: {
            type: String,
            required: true,
        },
        district: String,
        state: String,
        pincode: String,
        location: {
            lat: Number,
            lng: Number,
        },
        contactPerson: String,
        contactNumber: String,
        region: {
            type: String,
            required: true,
        },
        branch: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Indexes for faster lookups and filtering
CustomerSchema.index({ userId: 1 });
CustomerSchema.index({ region: 1, branch: 1 });
CustomerSchema.index({ name: "text" });

// Handle model compilation error in development
if (process.env.NODE_ENV !== "production" && mongoose.models.Customer) {
    delete mongoose.models.Customer;
}

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
