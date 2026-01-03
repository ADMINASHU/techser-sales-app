

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days (1 month)
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
