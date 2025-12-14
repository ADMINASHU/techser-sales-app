
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import Entry from "@/models/Entry";
import { redirect } from "next/navigation";
import EditEntryForm from "@/components/EditEntryForm";

export default async function EditEntryPage({ params }) {
    const { id } = await params;
    const session = await auth();
    if (!session) redirect("/login");

    // Restrict Admin
    if (session.user.role === "admin") {
        return <div>Admins cannot edit entries.</div>;
    }

    await dbConnect();
    const entryDoc = await Entry.findById(id);

    if (!entryDoc) {
        return <div>Entry not found</div>;
    }

    // Authorization: User can only edit own entries
    if (entryDoc.userId.toString() !== session.user.id) {
        return <div>Unauthorized</div>;
    }

    if (entryDoc.status !== "Not Started" || (entryDoc.stampIn && entryDoc.stampIn.time)) {
        return <div>Cannot edit an entry that has already started.</div>;
    }

    const entry = JSON.parse(JSON.stringify(entryDoc));

    return <EditEntryForm entry={entry} />;
}
