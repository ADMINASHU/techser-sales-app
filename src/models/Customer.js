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
        isActive: {
            type: Boolean,
            default: true,
        },
        entryCount: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Indexes for faster lookups and filtering
CustomerSchema.index({ userId: 1 });
CustomerSchema.index({ region: 1, branch: 1 });
CustomerSchema.index({ name: "text" });
CustomerSchema.index({ location: "2dsphere" }); // Geospatial index for proximity queries
CustomerSchema.index({ isActive: 1 }); // Index for active/inactive filtering
// Index for sorting by popularity
CustomerSchema.index({ entryCount: -1 });

export default mongoose.models.Customer || mongoose.model("Customer", CustomerSchema);
