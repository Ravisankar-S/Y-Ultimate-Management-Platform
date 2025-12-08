import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMatches, deleteMatch } from "../../../api/matches.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";
import { formatDateTime } from "../../../utils/format.js";

export default function MatchList({ tournamentId, onSelectMatch, activeMatchId }) {
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["matches"],
        queryFn: fetchMatches,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMatch,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
    });

    if (!tournamentId) {
        return <EmptyState title="Select a tournament" description="Choose a tournament to view its matches." />;
    }

    if (isLoading) {
        return <LoadingState label="Loading matches" />;
    }

    if (isError) {
        return (
            <Card title="Matches">
                <p className="text-sm text-rose-600">Failed to load matches. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    const matches = (data || []).filter((match) => match.tournament_id === tournamentId);

    if (matches.length === 0) {
        return <EmptyState title="No matches" description="Create or generate matches to see them here." />;
    }

    return (
        <Card title="Match List" subtitle="Manage scores and statuses">
            <ul className="divide-y divide-slate-200">
                {matches.map((match) => (
                    <li key={match.id} className="flex items-center justify-between gap-4 py-3 text-sm text-slate-600">
                        <div>
                            <p className="font-medium text-slate-900">
                                Match #{match.id} — Team {match.team_a_id} vs Team {match.team_b_id}
                            </p>
                            <p className="text-xs text-slate-500">Start: {formatDateTime(match.start_time)}</p>
                            <p className="text-xs text-slate-500">Status: {match.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">
                                {match.score_a} : {match.score_b}
                            </span>
                            <Button
                                variant={activeMatchId === match.id ? "primary" : "secondary"}
                                onClick={() => onSelectMatch(match.id)}
                            >
                                {activeMatchId === match.id ? "Live" : "Live scoring"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={deleteMutation.isPending}
                                onClick={() => deleteMutation.mutate(match.id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
            {deleteMutation.isError && (
                <p className="mt-3 text-sm text-rose-600">Failed to delete match. Try again.</p>
            )}
        </Card>
    );
}
