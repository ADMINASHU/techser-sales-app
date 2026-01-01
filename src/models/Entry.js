import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },
        // Keep customerName for text search index compatibility
        customerName: {
            type: String,
            required: true,
        },
        stampIn: {
            time: Date,
            location: {
                lat: Number,
                lng: Number,
                address: String,
            },
        },
        stampOut: {
            time: Date,
            location: {
                lat: Number,
                lng: Number,
                address: String,
            },
        },
        status: {
            type: String,
            enum: ["Not Started", "In Process", "Completed"],
            default: "Not Started",
        },
        entryDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        googleSheetRowId: Number, // To track row in Google Sheets for updates
    },
    { timestamps: true }
);

// Index for easier filtering
EntrySchema.index({ userId: 1, status: 1 });
EntrySchema.index({ userId: 1, entryDate: -1 }); // Fast user history lookup (Compound)
EntrySchema.index({ "stampIn.location": "2dsphere" }); // Geo queries
EntrySchema.index({ "stampIn.time": -1 });
EntrySchema.index({ createdAt: -1 });
EntrySchema.index({ userId: 1, createdAt: -1 }); // Composite for User Dashboard
EntrySchema.index({ customerName: "text" }); // Text index for Search

// Check if model exists and delete it in development to prevent schema caching issues
if (process.env.NODE_ENV !== "production" && mongoose.models.Entry) {
    delete mongoose.models.Entry;
}

export default mongoose.models.Entry || mongoose.model("Entry", EntrySchema);
