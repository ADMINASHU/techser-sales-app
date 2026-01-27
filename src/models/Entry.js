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
    //Denormalised user data for faster admin filtering
    userRegion: {
      type: String,
      index: true,
    },
    userBranch: {
      type: String,
      index: true,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

// Index for easier filtering
EntrySchema.index({ userId: 1, customerId: 1, status: 1 }); // Optimized for conflict check
EntrySchema.index({ userId: 1, entryDate: -1 }); // Fast user history lookup (Compound)
EntrySchema.index({ "stampIn.location": "2dsphere" }); // Geo queries
EntrySchema.index({ "stampIn.time": -1 });
EntrySchema.index({ createdAt: -1 });
EntrySchema.index({ userId: 1, createdAt: -1 }); // Composite for User Dashboard
// Text index for Search
EntrySchema.index({ customerName: "text" });

// Optimized Indexes for Admin Dashboard & Reporting
EntrySchema.index({ userRegion: 1, userBranch: 1, entryDate: -1 }); // Branch-level reporting
EntrySchema.index({ userRegion: 1, entryDate: -1 }); // Region-level reporting
EntrySchema.index({ status: 1, entryDate: -1 }); // Status-based filtering

export default mongoose.models.Entry || mongoose.model("Entry", EntrySchema);
