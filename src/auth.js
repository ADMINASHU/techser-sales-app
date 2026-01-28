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
          // Include all fields, especially region and branch which are required
          const user = await User.findOne({ email: credentials.email }).select(
            "+password",
          );

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
            user.password,
          );

          if (!isPasswordCorrect) {
            // console.log("Auth failed: Invalid password");
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            // Only set image URL if user actually has an image to prevent 404s
            image: user.image
              ? `/api/user/image?v=${user.updatedAt?.getTime() || Date.now()}`
              : null,
            role: user.role,
            status: user.status,
            region: user.region,
            branch: user.branch,
            contactNumber: user.contactNumber,
            address: user.address,
            enableStamping: user.enableStamping,
            designation: user.designation,
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
      if (user) {
        if (account?.provider === "google") {
          try {
            // EXCLUDE image data but check if it exists
            let dbUser = await User.findOne({ email: user.email }).select(
              "image",
            );
            let hasImage = false;

            if (!dbUser) {
              dbUser = await User.create({
                name: user.name,
                email: user.email,
                image: user.image, // Initial Google image URL
                provider: "google",
                status: "pending",
                role: "user",
              });
              hasImage = !!user.image;
            } else {
              hasImage = !!dbUser.image;
              // Refetch without image data for other fields
              dbUser = await User.findOne({ email: user.email }).select(
                "-image",
              );
            }

            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.region = dbUser.region;
            token.branch = dbUser.branch;
            token.contactNumber = dbUser.contactNumber;
            token.address = dbUser.address;
            token.enableStamping = !!dbUser.enableStamping;
            token.designation = dbUser.designation;

            // Only set image URL if user has an image
            token.image = hasImage
              ? `/api/user/image?v=${dbUser.updatedAt?.getTime() || Date.now()}`
              : null;
          } catch (error) {
            // console.error("Error in JWT Google callback:", error);
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.status = user.status;
          token.region = user.region;
          token.branch = user.branch;
          token.contactNumber = user.contactNumber;
          token.address = user.address;
          token.image = user.image; // Already set to URL in authorize()
          token.enableStamping = !!user.enableStamping;
          token.designation = user.designation;
        }
      }

      // HANDLE UPDATES FIRST if they exist, to prevent DB refresh from overwriting them in the same cycle
      if (trigger === "update" && session) {
        if (session.status) token.status = session.status;
        if (session.role) token.role = session.role;
        if (session.region) token.region = session.region;
        if (session.branch) token.branch = session.branch;
        if (session.contactNumber) token.contactNumber = session.contactNumber;
        if (session.address) token.address = session.address;
        if (typeof session.enableStamping !== "undefined")
          token.enableStamping = session.enableStamping;
        if (session.designation) token.designation = session.designation;

        if (session.image) {
          token.image = session.image.startsWith("data:image")
            ? `/api/user/image?v=${Date.now()}`
            : session.image;
        }
        return token; // Return early on update to avoid DB refresh in this trigger
      }

      if (token.id) {
        // If not signing in (subsequent requests), fetch fresh data from DB
        try {
          await dbConnect();
          const dbUser = await User.findById(token.id).select(
            "role status region branch contactNumber address image enableStamping designation",
          );
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.region = dbUser.region;
            token.branch = dbUser.branch;
            token.contactNumber = dbUser.contactNumber;
            token.address = dbUser.address;
            token.enableStamping = !!dbUser.enableStamping;
            token.designation = dbUser.designation;
          }
        } catch (error) {
          // console.error("Error refreshing token data:", error);
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
        session.user.contactNumber = token.contactNumber;
        session.user.address = token.address;
        session.user.image = token.image;
        session.user.enableStamping = !!token.enableStamping;
        session.user.designation = token.designation;
      }
      return session;
    },
  },
  // Debug in dev as per reference
  debug: process.env.NODE_ENV === "development",
});
