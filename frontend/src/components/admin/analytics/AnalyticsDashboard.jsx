import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGlobalAnalytics, fetchTournamentAnalytics } from "../../../api/analytics.js";
import StatCard from "../../common/StatCard.jsx";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";

export default function AnalyticsDashboard({ selectedTournamentId, onSelectTournament, tournaments = [] }) {
    const {
        data: globalAnalytics,
        isLoading: loadingGlobal,
        isError: globalError,
    } = useQuery({
        queryKey: ["analytics", "global"],
        queryFn: fetchGlobalAnalytics,
    });

    const {
        data: tournamentAnalytics,
        isLoading: loadingTournament,
    } = useQuery({
        queryKey: ["analytics", "tournament", selectedTournamentId],
        queryFn: () => fetchTournamentAnalytics(selectedTournamentId),
        enabled: Boolean(selectedTournamentId),
    });

    if (loadingGlobal) {
        return <LoadingState label="Loading analytics" />;
    }

    if (globalError) {
        return <Card title="Analytics" subtitle="Global overview">
            <p className="text-sm text-rose-600">Failed to load analytics. Please try again.</p>
        </Card>;
    }

    const globalData = globalAnalytics?.data ?? {};
    const tournamentData = tournamentAnalytics?.data ?? null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-900">Global Analytics</h2>
                <p className="text-sm text-slate-500">Snapshot across all tournaments.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Matches Completed" value={globalData.completed_matches ?? 0} />
                <StatCard label="Active Tournaments" value={globalData.total_tournaments ?? 0} />
                <StatCard label="Avg Spirit Score" value={globalData.average_spirit_score ?? 0} />
                <StatCard label="Total Participants" value={globalData.total_participants ?? 0} />
            </div>

        <Card
            title="Tournament Analytics"
            subtitle="Dive deeper into a specific event"
            actions={
                <select
                    value={selectedTournamentId || ""}
                    onChange={(event) => onSelectTournament(event.target.value ? Number(event.target.value) : null)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                    <option value="">Select tournament</option>
                    {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>
                            {tournament.title}
                        </option>
                    ))}
                </select>
            }
        >
            {!selectedTournamentId && (
                <p className="text-sm text-slate-500">Choose a tournament to view its analytics.</p>
            )}
            {selectedTournamentId && loadingTournament && <LoadingState label="Loading tournament analytics" />}
            {selectedTournamentId && !loadingTournament && tournamentData && (
                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard label="Team Count" value={tournamentData.team_count ?? 0} />
                    <StatCard label="Total Matches" value={tournamentData.total_matches ?? 0} />
                    <StatCard label="Completed Matches" value={tournamentData.completed_matches ?? 0} />
                    <StatCard label="Avg Spirit Score" value={tournamentData.average_spirit_score ?? 0} />
                </div>
            )}
        </Card>
        </div>
    );
}
