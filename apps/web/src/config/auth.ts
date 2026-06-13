import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password ?? "");
        const demoEmail = process.env.AUTH_DEMO_EMAIL?.trim().toLowerCase();
        const demoPassword = process.env.AUTH_DEMO_PASSWORD;

        if (!demoEmail || !demoPassword) {
          return null;
        }

        if (email !== demoEmail || password !== demoPassword) {
          return null;
        }

        return {
          id: "demo-user",
          email: demoEmail,
          name: "Demo Culturando",
        };
      },
    }),
  ],
});
