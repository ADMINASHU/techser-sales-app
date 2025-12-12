import mongoose from "mongoose";

const EntrySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerAddress: String,
        district: String,
        state: String,
        pincode: String,
        location: {
            lat: Number,
            lng: Number,
        },
        region: String,
        branch: String,
        purpose: String,
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
        googleSheetRowId: Number, // To track row in Google Sheets for updates
    },
    { timestamps: true }
);

// Index for easier filtering
EntrySchema.index({ userId: 1, status: 1 });
EntrySchema.index({ "stampIn.time": -1 });

export default mongoose.models.Entry || mongoose.model("Entry", EntrySchema);
