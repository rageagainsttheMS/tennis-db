import { auth } from "@/auth";
import MatchDetails from "@/components/ui/MatchDetails";
import { getMatchById } from "@/lib/actions/match.actions";
import { redirect } from "next/navigation";

const MatchPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const session = await auth();
    if(!session) {
        redirect("/signin");
    }

    const match = await getMatchById(Number(id));
    if (!match) {
        redirect("/not-found");
    }

    return <MatchDetails match={match} />;
}

export default MatchPage;