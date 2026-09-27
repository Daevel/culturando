import { prisma } from "@culturando/db";
import NextAuth, { type NextAuthResult } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeCredentials } from "@/features/auth/lib/authorize-credentials";

function isUserRole(value: unknown): value is "admin" | "user" {
  return value === "admin" || value === "user";
}

function isSalutationPreference(value: unknown): value is "masculine" | "feminine" | "neutral" {
  return value === "masculine" || value === "feminine" || value === "neutral";
}

const nextAuth = NextAuth({
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
      authorize: (credentials, request) => authorizeCredentials(credentials, request.headers),
    }),
  ],
});

export const handlers: NextAuthResult["handlers"] = nextAuth.handlers;
export const signIn: NextAuthResult["signIn"] = nextAuth.signIn;
export const signOut: NextAuthResult["signOut"] = nextAuth.signOut;
export const auth: NextAuthResult["auth"] = nextAuth.auth;

function getOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
