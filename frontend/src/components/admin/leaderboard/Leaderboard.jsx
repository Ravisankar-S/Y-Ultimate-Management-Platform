import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLeaderboard } from "../../../api/leaderboard.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";

export default function Leaderboard({ tournamentId }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["leaderboard", tournamentId],
        queryFn: () => fetchLeaderboard(tournamentId),
        enabled: Boolean(tournamentId),
    });

    if (!tournamentId) {
        return <EmptyState title="Select a tournament" description="Choose a tournament to view standings." />;
    }

    if (isLoading) {
        return <LoadingState label="Loading leaderboard" />;
    }

    if (isError) {
        return (
            <Card title="Leaderboard">
                <p className="text-sm text-rose-600">Failed to load leaderboard. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyState title="No data" description="Leaderboard will populate once matches are completed." />;
    }

    return (
        <Card title="Leaderboard" subtitle="Ranked by points, goal difference and spirit">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            {["Rank", "Team", "Pts", "W", "L", "D", "GF", "GA", "GD", "Spirit Avg"].map((header) => (
                                <th key={header} className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-slate-500">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {data.map((row) => (
                            <tr key={row.team_id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-slate-700">{row.rank}</td>
                                <td className="px-3 py-2 text-slate-700">{row.team_name}</td>
                                <td className="px-3 py-2 text-slate-700">{row.points}</td>
                                <td className="px-3 py-2 text-slate-700">{row.wins}</td>
                                <td className="px-3 py-2 text-slate-700">{row.losses}</td>
                                <td className="px-3 py-2 text-slate-700">{row.draws}</td>
                                <td className="px-3 py-2 text-slate-700">{row.goals_for}</td>
                                <td className="px-3 py-2 text-slate-700">{row.goals_against}</td>
                                <td className="px-3 py-2 text-slate-700">{row.goal_diff}</td>
                                <td className="px-3 py-2 text-slate-700">{row.spirit_avg}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
