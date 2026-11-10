import MatchDetails from "@/components/ui/MatchDetails";
import { getMatchById } from "@/lib/actions/match.actions";
import { notFound } from "next/navigation";

const MatchPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const matchId = Number(id);
    if (!Number.isInteger(matchId)) notFound();

    const match = await getMatchById(matchId);
    if (!match) {
        notFound();
    }

    return <MatchDetails match={match} />;
}

export default MatchPage;