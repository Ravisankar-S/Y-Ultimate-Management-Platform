import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSpiritScores } from "../../../api/spirit.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import { formatDateTime } from "../../../utils/format.js";

export default function SpiritScoresTable({ tournamentId }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["spirit", tournamentId],
        queryFn: () => fetchSpiritScores(tournamentId),
    });

    const rows = useMemo(() => {
        if (!data) return [];
        const items = [];
        data.forEach((match) => {
            (match.spirit_scores || []).forEach((score) => {
                items.push({
                    matchId: match.id,
                    submittedAt: score.created_at,
                    fromTeam: score.from_team_id,
                    toTeam: score.to_team_id,
                    total: score.total,
                    details: score,
                });
            });
        });
        return items;
    }, [data]);

    if (!tournamentId) {
        return <EmptyState title="Select a tournament" description="Choose a tournament to audit spirit scores." />;
    }

    if (isLoading) {
        return <LoadingState label="Loading spirit scores" />;
    }

    if (isError) {
        return (
            <Card title="Spirit scores">
                <p className="text-sm text-rose-600">Failed to load spirit scores. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (rows.length === 0) {
        return <EmptyState title="No spirit submissions" description="Scores will appear after teams submit them." />;
    }

    return (
        <Card title="Spirit Scores" subtitle="Team-to-team ratings">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">Match</th>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">From team</th>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">To team</th>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">Total</th>
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">Submitted</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {rows.map((row, index) => (
                            <tr key={`${row.matchId}-${row.fromTeam}-${index}`} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-700">#{row.matchId}</td>
                                <td className="px-3 py-2 text-slate-700">{row.fromTeam}</td>
                                <td className="px-3 py-2 text-slate-700">{row.toTeam}</td>
                                <td className="px-3 py-2 text-slate-700">{row.total}</td>
                                <td className="px-3 py-2 text-slate-500">{formatDateTime(row.submittedAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
