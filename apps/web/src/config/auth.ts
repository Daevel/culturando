import { prisma } from "@culturando/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { verifyPassword } from "@/lib/password";

function isUserRole(value: unknown): value is "admin" | "user" {
  return value === "admin" || value === "user";
}

function isSalutationPreference(value: unknown): value is "masculine" | "feminine" | "neutral" {
  return value === "masculine" || value === "feminine" || value === "neutral";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.avatarUrl = user.avatarUrl;
        token.nickname = user.nickname;
        token.role = user.role;
        token.salutationPreference = user.salutationPreference;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = String(token.id ?? token.sub ?? "");
        const profile = userId
          ? await prisma.user.findUnique({
              where: { id: userId },
              select: {
                avatarUrl: true,
                nickname: true,
              },
            })
          : null;

        session.user.id = userId;
        session.user.avatarUrl = profile?.avatarUrl ?? getOptionalString(token.avatarUrl);
        session.user.nickname = profile?.nickname ?? getOptionalString(token.nickname);
        session.user.role = isUserRole(token.role) ? token.role : "user";
        session.user.salutationPreference = isSalutationPreference(token.salutationPreference)
          ? token.salutationPreference
          : "neutral";
      }

      return session;
    },
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
        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user?.passwordHash || !user.emailVerifiedAt) {
          return null;
        }

        const isValidPassword = await verifyPassword(password, user.passwordHash);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl ?? undefined,
          nickname: user.nickname ?? undefined,
          role: user.role,
          salutationPreference: user.salutationPreference,
        };
      },
    }),
  ],
});

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
