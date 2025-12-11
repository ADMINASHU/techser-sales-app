import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { redirect } from "next/navigation";

export default async function VerifiedLayout({ children }) {
    const session = await auth();

    if (!session) redirect("/login");

    await dbConnect();
    const user = await User.findById(session.user.id);

    if (!user) redirect("/login");

    // Check Profile Completion
    // Name, Contact Number, Address, Region, Branch
    const isProfileComplete =
        user.name &&
        user.contactNumber &&
        user.address &&
        user.region &&
        user.branch;

    if (!isProfileComplete) {
        redirect("/setup");
    }

    // Check Verification Status
    if (user.status !== "verified" && user.role !== "admin") {
        redirect("/verification");
    }

    return <>{children}</>;
}
