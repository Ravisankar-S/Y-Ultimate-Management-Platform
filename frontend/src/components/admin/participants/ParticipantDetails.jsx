import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchParticipant } from "../../../api/participants.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import { formatDate } from "../../../utils/format.js";

export default function ParticipantDetails({ participantId }) {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["participant", participantId],
        queryFn: () => fetchParticipant(participantId),
        enabled: Boolean(participantId),
    });

    if (!participantId) {
        return <EmptyState title="Select a participant" description="Choose someone to view their profile." />;
    }

    if (isLoading) {
        return <LoadingState label="Loading participant" />;
    }

    if (isError) {
        return (
            <Card title="Participant profile">
                <p className="text-sm text-rose-600">Failed to load participant. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <Card title={`${data.first_name} ${data.last_name || ""}`} subtitle={data.participant_type}>
            <dl className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">Gender</dt>
                    <dd>{data.gender || "-"}</dd>
                </div>
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">Date of birth</dt>
                    <dd>{formatDate(data.dob)}</dd>
                </div>
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">School</dt>
                    <dd>{data.school || "-"}</dd>
                </div>
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">Community</dt>
                    <dd>{data.community || "-"}</dd>
                </div>
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">Primary contact</dt>
                    <dd>{data.primary_contact || "-"}</dd>
                </div>
                <div className="space-y-1">
                    <dt className="font-medium text-slate-500">Status</dt>
                    <dd>{data.current_status}</dd>
                </div>
                <div className="md:col-span-2 space-y-1">
                    <dt className="font-medium text-slate-500">Notes</dt>
                    <dd>{data.notes || "-"}</dd>
                </div>
            </dl>
        </Card>
    );
}
