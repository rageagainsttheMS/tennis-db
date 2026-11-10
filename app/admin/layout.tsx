import { auth } from "@/auth";
import { isAdminSession } from "@/lib/utils/auth-guards";
import { ROUTES } from "@/types/constants";
import { redirect } from "next/navigation";

// Server-side role check for every /admin page, including the client-component create pages.
// proxy.ts does the same check earlier; this is defence in depth.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect(ROUTES.SIGNIN);
  if (!isAdminSession(session)) redirect("/");
  return <>{children}</>;
}
