import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    // console.log("Auth failed: Missing credentials");
                    return null;
                }

                try {
                    await dbConnect();
                    // EXCLUDE image field from selection to avoid fetching large Base64 strings
                    const user = await User.findOne({ email: credentials.email })
                        .select("+password -image");

                    if (!user) {
                        // console.log("Auth failed: User not found");
                        return null;
                    }

                    if (user.provider && user.provider !== "credentials") {
                        // console.log("Auth failed: Wrong provider", user.provider);
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        // console.log("Auth failed: Invalid password");
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        // Always return the API URL. The UI handles 404s/fallbacks gracefully.
                        image: `/api/user/image?v=${user.updatedAt?.getTime() || Date.now()}`,
                        role: user.role,
                        status: user.status,
                        region: user.region,
                        branch: user.branch,
                        viewPreference: user.viewPreference,
                    };
                } catch (error) {
                    //   console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, account, trigger, session }) {
            if (trigger === "update" && session) {
                // console.log("[Auth] JWT Update Triggered:", session);
                if (session.status) token.status = session.status;
                if (session.role) token.role = session.role;
                if (session.viewPreference) token.viewPreference = session.viewPreference;             
                // Add Region and Branch updates
                if (session.region) token.region = session.region;
                if (session.branch) token.branch = session.branch;

                if (session.image) {
                     // If session update provides a new image (e.g. after upload), use it or the URL
                    token.image = session.image.startsWith("data:image")
                        ? `/api/user/image?v=${Date.now()}`
                        : session.image;
                }
                // console.log("[Auth] New token role:", token.role);
            }

            if (user) {
                if (account?.provider === "google") {
                    try {
                        await dbConnect();
                        // EXCLUDE image field here too
                        let dbUser = await User.findOne({ email: user.email }).select("-image");

                        if (!dbUser) {
                            dbUser = await User.create({
                                name: user.name,
                                email: user.email,
                                image: user.image, // Initial Google image URL
                                provider: "google",
                                status: "pending",
                                role: "user"
                            });
                        }

                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.status = dbUser.status;
                        token.region = dbUser.region;
                        token.branch = dbUser.branch;
                        token.viewPreference = dbUser.viewPreference;

                        // Use API URL preferably to ensure consistency if they update it later
                        token.image = `/api/user/image?v=${dbUser.updatedAt?.getTime() || Date.now()}`;

                    } catch (error) {
                        // console.error("Error in JWT Google callback:", error);
                    }
                } else {
                    token.id = user.id;
                    token.role = user.role;
                    token.status = user.status;
                    token.region = user.region;
                    token.branch = user.branch;
                    token.viewPreference = user.viewPreference;
                    token.image = user.image; // Already set to URL in authorize()
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
                session.user.region = token.region;
                session.user.branch = token.branch;
                session.user.viewPreference = token.viewPreference;
                session.user.image = token.image;
            }
            return session;
        },
    },
    // Debug in dev as per reference
    debug: process.env.NODE_ENV === 'development',
});
