import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_secret_do_not_use_in_production";

export async function verifyAuth(req) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        return null;
    }
}

export function unauthorizedResponse() {
    return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
    );
}
