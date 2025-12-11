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
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await dbConnect();
                    const user = await User.findOne({ email: credentials.email }).select(
                        "+password"
                    );

                    if (!user) {
                        return null;
                    }

                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );

                    if (!isPasswordCorrect) {
                        return null;
                    }

                    return user;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    // No need to duplicate pages/session strategy as they are in authConfig
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, account, profile }) {
            console.log("WAIT: signIn callback", { email: user?.email, provider: account?.provider });
            if (account.provider === "google") {
                try {
                    await dbConnect();
                    const existingUser = await User.findOne({ email: user.email });

                    if (!existingUser) {
                        console.log("Creating new Google user");
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            provider: "google",
                            status: "pending",
                        });
                        console.log("User created");
                    } else {
                        console.log("User already exists", existingUser._id);
                    }
                    return true;
                } catch (error) {
                    console.error("Error in signIn callback:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            console.log("WAIT: jwt callback", { tokenUser: token?.name, user: user?.email, provider: account?.provider });
            if (user) {
                if (account?.provider === "google") {
                    await dbConnect();
                    const dbUser = await User.findOne({ email: user.email });
                    console.log("jwt: found dbUser?", dbUser?._id);
                    if (dbUser) {
                        token.id = dbUser._id.toString();
                        token.role = dbUser.role;
                    }
                } else {
                    token.role = user.role;
                    token.id = (user._id || user.id).toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            // console.log("WAIT: session callback", { tokenId: token?.id });
            if (token) {
                session.user.id = token.id;
                session.user.role = token.role;

                try {
                    await dbConnect();
                    const dbUser = await User.findById(token.id);
                    // console.log("session: found dbUser?", !!dbUser);
                    if (dbUser) {
                        session.user.role = dbUser.role;
                        session.user.status = dbUser.status;
                        session.user.name = dbUser.name;
                        session.user.image = dbUser.image;
                    }
                } catch (e) {
                    console.error("Session refresh error", e);
                }
            }
            return session;
        },
    },
});
