import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchTournaments } from "../../../api/tournaments.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Badge from "../../common/Badge.jsx";
import Button from "../../common/Button.jsx";
import { formatDate } from "../../../utils/format.js";

export default function TournamentsList({ activeId, onSelect }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["tournaments"],
        queryFn: fetchTournaments,
    });

    if (isLoading) {
        return <LoadingState label="Loading tournaments" />;
    }

    if (isError) {
        return (
            <Card title="Tournaments">
                <p className="text-sm text-rose-600">Unable to load tournaments. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyState title="No tournaments yet" description="Create your first tournament to get started." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((tournament) => (
                <Card
                    key={tournament.id}
                    title={tournament.title}
                    subtitle={tournament.location || "Location TBD"}
                    className={activeId === tournament.id ? "border-blue-500" : ""}
                    actions={
                        <Badge variant={tournament.is_published ? "success" : "warning"}>
                            {tournament.is_published ? "Published" : "Draft"}
                        </Badge>
                    }
                >
                    <dl className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                            <dt>Start</dt>
                            <dd>{formatDate(tournament.start_date)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt>End</dt>
                            <dd>{formatDate(tournament.end_date)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt>Slug</dt>
                            <dd>{tournament.slug}</dd>
                        </div>
                    </dl>
                    <Button
                        variant={activeId === tournament.id ? "primary" : "secondary"}
                        className="mt-4 w-full"
                        onClick={() => onSelect(tournament.id)}
                    >
                        {activeId === tournament.id ? "Selected" : "View details"}
                    </Button>
                </Card>
            ))}
        </div>
    );
}
