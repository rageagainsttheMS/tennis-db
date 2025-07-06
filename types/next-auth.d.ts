
declare module "next-auth" {
  interface User {
    email?: string;
    role?: string;
  }
  interface Session {
    user?: User;
  }
}