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
            if (trigger === "update" && session) {
                if (session.status) token.status = session.status;
                if (session.role) token.role = session.role;
                if (session.viewPreference) token.viewPreference = session.viewPreference;
                
                // If the updated image is base64, store a reference instead of the actual data
                if (session.image) {
                    token.image = session.image.startsWith("data:image") 
                        ? `/api/user/image?v=${Date.now()}` 
                        : session.image;
                }
            }

            if (user) {
                if (account?.provider === "google") {
                    try {
                        await dbConnect();
                        let dbUser = await User.findOne({ email: user.email });

                        if (!dbUser) {
                            dbUser = await User.create({
                                name: user.name,
                                email: user.email,
                                image: user.image,
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
                        
                        // Handle large images from DB
                        token.image = dbUser.image?.startsWith("data:image")
                            ? `/api/user/image?v=${dbUser.updatedAt?.getTime() || Date.now()}`
                            : dbUser.image;

                    } catch (error) {
                        console.error("Error in JWT Google callback:", error);
                    }
                } else {
                    token.id = user.id;
                    token.role = user.role;
                    token.status = user.status;
                    token.branch = user.branch;
                    token.viewPreference = user.viewPreference;
                    
                    // The 'user' object here comes from authorize()
                    // If it was base64, we should have already sanitized it or do it now
                    token.image = user.image?.startsWith("data:image")
                        ? `/api/user/image?v=${Date.now()}`
                        : user.image;
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
