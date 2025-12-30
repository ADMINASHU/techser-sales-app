import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    const session = await auth();
    if (!session) return new Response("Unauthorized", { status: 401 });

    try {
        await dbConnect();
        const user = await User.findById(session.user.id).select("image");
        if (!user || !user.image) {
            return new Response("Not Found", { status: 404 });
        }

        // Check if it's base64
        if (user.image.startsWith("data:image")) {
            const [metadata, base64Data] = user.image.split(",");
            const contentType = metadata.split(":")[1].split(";")[0];
            const buffer = Buffer.from(base64Data, "base64");
            return new Response(buffer, {
                headers: {
                    "Content-Type": contentType,
                    "Cache-Control": "public, max-age=3600",
                },
            });
        }

        // If it's a URL, redirect
        return Response.redirect(user.image);
    } catch (error) {
        return new Response("Error", { status: 500 });
    }
}
