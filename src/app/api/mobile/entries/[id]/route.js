import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import Customer from "@/models/Customer";
import { verifyAuth, unauthorizedResponse } from "@/lib/mobileAuth";

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        const { id } = params;
        const body = await req.json(); // Expected: { status, stampOut, location, ... }

        await dbConnect();

        const entry = await Entry.findById(id);

        if (!entry) {
            return NextResponse.json(
                { error: "Entry not found" },
                { status: 404 }
            );
        }

        // Authorization check: User can only update their own entries unless admin
        if (user.role !== "admin" && entry.userId.toString() !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized to update this entry" },
                { status: 403 }
            );
        }

        // Logic for "Stamp Out" or general update
        if (body.status === "Completed" && body.stampOut) {
            // Ensure stampIn exists
            if (!entry.stampIn) {
                return NextResponse.json(
                    { error: "Cannot stamp out without stamp in" },
                    { status: 400 }
                );
            }
        }

        const updatedEntry = await Entry.findByIdAndUpdate(
            id,
            { ...body },
            { new: true } // Return updated doc
        );

        return NextResponse.json({ success: true, entry: updatedEntry });

    } catch (error) {
        console.error("Mobile Update Entry Error:", error);
        return NextResponse.json(
            { error: "Failed to update entry" },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuth(req);
        if (!user) return unauthorizedResponse();

        const { id } = params;

        await dbConnect();

        const entry = await Entry.findById(id);

        if (!entry) {
            return NextResponse.json(
                { error: "Entry not found" },
                { status: 404 }
            );
        }

        // Authorization check
        if (user.role !== "admin" && entry.userId.toString() !== user.id) {
            return NextResponse.json(
                { error: "Unauthorized to delete this entry" },
                { status: 403 }
            );
        }

        await Entry.findByIdAndDelete(id);

        // Optionally decrement customer count logic here if needed, 
        // but complex to track if it was "Completed" or not. 
        // For now, simplicity.

        return NextResponse.json({ success: true, message: "Entry deleted" });

    } catch (error) {
        console.error("Mobile Delete Entry Error:", error);
        return NextResponse.json(
            { error: "Failed to delete entry" },
            { status: 500 }
        );
    }
}
