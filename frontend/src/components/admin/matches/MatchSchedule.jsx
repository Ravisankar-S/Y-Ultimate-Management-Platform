import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTournamentSchedule } from "../../../api/matches.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import { formatDateTime } from "../../../utils/format.js";

export default function MatchSchedule({ tournamentId }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["schedule", tournamentId],
        queryFn: () => fetchTournamentSchedule(tournamentId),
        enabled: Boolean(tournamentId),
    });

    if (!tournamentId) {
        return null;
    }

    if (isLoading) {
        return <LoadingState label="Loading schedule" />;
    }

    if (isError) {
        return (
            <Card title="Schedule">
                <p className="text-sm text-rose-600">Failed to load schedule. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data || !data.schedule || data.schedule.length === 0) {
        return <EmptyState title="No schedule" description="Generate matches to produce a schedule." />;
    }

    return (
        <Card title="Tournament Schedule" subtitle={data.tournament_title}>
            <div className="space-y-6">
                {data.schedule.map((day) => (
                    <div key={day.date}>
                        <h4 className="text-sm font-semibold text-slate-700">{day.date}</h4>
                        <div className="mt-3 space-y-3">
                            {day.fields.map((field) => (
                                <div key={field.field_id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">{field.field_id}</p>
                                    <ul className="mt-2 space-y-2 text-sm text-slate-600">
                                        {field.matches.map((match) => (
                                            <li key={match.match_id} className="flex items-center justify-between">
                                                <span>
                                                    Match #{match.match_id} — Team {match.team_a_id} vs Team {match.team_b_id}
                                                </span>
                                                <span>{formatDateTime(match.start_time)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
