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
                    console.log("Auth failed: Missing credentials");
                    return null;
                }

                try {
                    await dbConnect();
                    const user = await User.findOne({ email: credentials.email }).select(
                        "+password"
                    );

                    if (!user) {
                        console.log("Auth failed: User not found");
                        return null;
                    }

                    if (user.provider && user.provider !== "credentials") {
                        console.log("Auth failed: Wrong provider", user.provider);
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        console.log("Auth failed: Invalid password");
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        // image: user.image, // Removed to reduce cookie size
                        role: user.role,
                        status: user.status,
                        region: user.region,
                        branch: user.branch,
                        viewPreference: user.viewPreference,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user, account, trigger, session }) {
            // Handle updates (e.g. valid -> verified) if triggered client side
            if (trigger === "update" && session) {
                if (session.status) token.status = session.status;
                if (session.role) token.role = session.role;
                if (session.viewPreference) token.viewPreference = session.viewPreference;
                // Add other updateable fields here
            }

            if (user) {
                // Initial sign in
                if (account?.provider === "google") {
                    try {
                        await dbConnect();
                        let dbUser = await User.findOne({ email: user.email });

                        if (!dbUser) {
                            console.log("Creating new Google user");
                            dbUser = await User.create({
                                name: user.name,
                                email: user.email,
                                image: user.image,
                                provider: "google",
                                status: "pending",
                                role: "user" // Default role
                            });
                        } else if (!dbUser.provider) {
                            // Link existing user to Google if email matches and no provider
                            // Optional consistency check
                            dbUser.provider = "google";
                            await dbUser.save();
                        }

                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                        token.status = dbUser.status;
                        token.region = dbUser.region;
                        token.branch = dbUser.branch;
                        token.viewPreference = dbUser.viewPreference;
                    } catch (error) {
                        console.error("Error in JWT Google callback:", error);
                    }
                } else {
                    // Credentials login - user object comes from authorize() return
                    token.id = user.id;
                    token.role = user.role;
                    token.status = user.status;
                    token.region = user.region;
                    token.branch = user.branch;
                    token.viewPreference = user.viewPreference;
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
                // Inherit default fields from token/adapter usually, but ensure they are mapped
                // session.user.name & email usually persist from initial
            }
            return session;
        },
    },
    // Debug in dev as per reference
    debug: process.env.NODE_ENV === 'development',
});
