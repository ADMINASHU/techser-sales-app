import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session) {
    const isAdmin = session.user.role === "admin";
    const isSuperUser = session.user.role === "super_user";
    const showStamping = !!session.user.enableStamping;

    if (isAdmin) {
      redirect("/dashboard");
    } else if (isSuperUser) {
      if (showStamping) {
        redirect("/customer-log");
      } else {
        redirect("/dashboard");
      }
    } else {
      redirect("/customer-log");
    }
  } else {
    redirect("/login");
  }
}
