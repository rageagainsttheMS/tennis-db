// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    email?: string;
    role?: string;
  }
  
  interface Session extends DefaultSession {
    user: User;
  }
}