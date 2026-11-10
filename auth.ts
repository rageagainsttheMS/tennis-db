import NextAuth from "next-auth";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";
import { ADMINROLE } from "@/types/constants";
import { isAdminEmail } from "@/lib/utils/admin";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/signIn",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.role = isAdminEmail(user.email) ? ADMINROLE : "user";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.role) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
