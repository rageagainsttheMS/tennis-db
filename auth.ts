import NextAuth from "next-auth";
import { Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
    }),
  ],
  callbacks: {
     async jwt({ token, user }: { token: JWT; user: User }) {
      if (user) {
        token.role = user?.email === "williamawrigley@gmail.com" ? "admin" : "user";
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