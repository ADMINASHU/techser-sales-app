
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
};
