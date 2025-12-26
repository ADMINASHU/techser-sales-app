

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    providers: [],
    callbacks: {
        authorized({ auth }) {
            return !!auth?.user;
        },
    },
    secret: process.env.AUTH_SECRET,
    trustHost: true, // Allow NextAuth to trust proxy headers (required for Vercel)
};
