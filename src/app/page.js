import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await auth();
    if (session) {
        if (session.user.role === "admin") {
            redirect("/dashboard");
        } else {
            redirect("/customer-log");
        }
    } else {
        redirect("/login");
    }
}
