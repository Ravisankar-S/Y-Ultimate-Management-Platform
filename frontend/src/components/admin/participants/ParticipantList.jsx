import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchParticipants } from "../../../api/participants.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";

const filters = [
    { label: "All", value: "" },
    { label: "Players", value: "player" },
    { label: "Coaches", value: "coach" },
    { label: "Volunteers", value: "volunteer" },
];

export default function ParticipantList({ onSelectParticipant, selectedId }) {
    const [filter, setFilter] = useState(filters[0]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["participants", filter.value],
        queryFn: () => fetchParticipants(filter.value ? { participant_type: filter.value } : {}),
    });

    if (isLoading) {
        return <LoadingState label="Loading participants" />;
    }

    if (isError) {
        return (
            <Card title="Participants">
                <p className="text-sm text-rose-600">Failed to load participants. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    return (
        <Card
            title="Participants"
            subtitle="Browse and assign roles"
            actions={
                <div className="flex items-center gap-2">
                    {filters.map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                                filter.value === option.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                            onClick={() => setFilter(option)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            }
        >
            {!data || data.length === 0 ? (
                <EmptyState title="No participants" description="Create participants to see them listed here." />
            ) : (
                <ul className="divide-y divide-slate-200">
                    {data.map((participant) => (
                        <li key={participant.id} className="flex items-center justify-between py-3 text-sm text-slate-600">
                            <div>
                                <p className="font-medium text-slate-900">
                                    {participant.first_name} {participant.last_name || ""}
                                </p>
                                <p className="text-xs text-slate-500">Type: {participant.participant_type}</p>
                            </div>
                            <Button
                                variant={selectedId === participant.id ? "primary" : "secondary"}
                                onClick={() => onSelectParticipant(participant.id)}
                            >
                                {selectedId === participant.id ? "Selected" : "View"}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
