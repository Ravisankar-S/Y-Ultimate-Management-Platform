import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTournament } from "../../../api/tournaments.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import Button from "../../common/Button.jsx";
import { formatDate } from "../../../utils/format.js";

const actions = [
    { id: "teams", label: "View Teams" },
    { id: "matches", label: "Manage Matches" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "media", label: "Media" },
    { id: "spirit", label: "Spirit Scores" },
    { id: "analytics", label: "Analytics" },
];

export default function TournamentDetails({ tournamentId, onNavigate }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["tournament", tournamentId],
        queryFn: () => fetchTournament(tournamentId),
        enabled: Boolean(tournamentId),
    });

    if (!tournamentId) {
        return null;
    }

    if (isLoading) {
        return <LoadingState label="Loading tournament" />;
    }

    if (isError) {
        return (
            <Card title="Tournament details">
                <p className="text-sm text-rose-600">Failed to load tournament. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card title={data.title} subtitle={data.description || "No description provided"}>
            <div className="grid gap-4 md:grid-cols-2">
                <dl className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                        <dt>Start date</dt>
                        <dd>{formatDate(data.start_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt>End date</dt>
                        <dd>{formatDate(data.end_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt>Location</dt>
                        <dd>{data.location || "TBD"}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt>Sponsor</dt>
                        <dd>{data.sponsor || "-"}</dd>
                    </div>
                </dl>
                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                        <span>Slug</span>
                        <span>{data.slug}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Published</span>
                        <span>{data.is_published ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Created</span>
                        <span>{formatDate(data.created_at)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
                {actions.map((action) => (
                    <Button key={action.id} variant="outline" onClick={() => onNavigate(action.id)}>
                        {action.label}
                    </Button>
                ))}
            </div>
        </Card>
    );
}
