import { redirect } from "next/navigation";
import { ROUTES } from "@/types/constants";

// The player list is public now; admins see the bio columns there.
export default function AdminPlayersPage() {
  redirect(ROUTES.PLAYERS);
}
