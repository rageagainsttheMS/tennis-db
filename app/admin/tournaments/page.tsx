import { redirect } from "next/navigation";
import { ROUTES } from "@/types/constants";

// The tournament list is public now; admins see the details column there.
export default function AdminTournamentsPage() {
  redirect(ROUTES.TOURNAMENTS);
}
