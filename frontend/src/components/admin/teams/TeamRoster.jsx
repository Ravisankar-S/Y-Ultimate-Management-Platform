import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTeamRoster, addTeamMembers, removeTeamMember } from "../../../api/teams.js";
import { fetchParticipants } from "../../../api/participants.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";

const initialForm = {
    participant_id: "",
    role: "player",
    jersey_number: "",
    is_active: true,
};

export default function TeamRoster({ teamId }) {
    const [form, setForm] = useState(initialForm);
    const queryClient = useQueryClient();

    const rosterQuery = useQuery({
        queryKey: ["team", "roster", teamId],
        queryFn: () => fetchTeamRoster(teamId),
        enabled: Boolean(teamId),
    });

    const participantsQuery = useQuery({
        queryKey: ["participants", { scope: "roster" }],
        queryFn: () => fetchParticipants(),
    });

    const addMutation = useMutation({
        mutationFn: ({ teamId: id, payload }) => addTeamMembers({ teamId: id, members: [payload] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["team", "roster", teamId] });
            setForm(initialForm);
        },
    });

    const removeMutation = useMutation({
        mutationFn: ({ teamId: id, memberId }) => removeTeamMember({ teamId: id, memberId }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team", "roster", teamId] }),
    });

    const participants = useMemo(() => participantsQuery.data || [], [participantsQuery.data]);

    if (!teamId) {
        return <EmptyState title="Select a team" description="Choose a team to manage its roster." />;
    }

    if (rosterQuery.isLoading) {
        return <LoadingState label="Loading roster" />;
    }

    return (
        <Card title="Team Roster" subtitle="Add or remove participants">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!form.participant_id) return;
                    addMutation.mutate({
                        teamId,
                        payload: {
                            ...form,
                            participant_id: Number(form.participant_id),
                        },
                    });
                }}
                className="grid gap-3 md:grid-cols-5"
            >
                <label className="md:col-span-2 text-sm font-medium text-slate-600">
                    Participant
                    <select
                        required
                        value={form.participant_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, participant_id: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    >
                        <option value="">Select participant</option>
                        {participants.map((participant) => (
                            <option key={participant.id} value={participant.id}>
                                {participant.first_name} {participant.last_name || ""} ({participant.participant_type})
                            </option>
                        ))}
                    </select>
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Role
                    <input
                        value={form.role}
                        onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Jersey #
                    <input
                        value={form.jersey_number}
                        onChange={(event) => setForm((prev) => ({ ...prev, jersey_number: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300"
                    />
                    Active
                </label>
                <div className="md:col-span-5">
                    <Button type="submit" disabled={addMutation.isPending}>
                        {addMutation.isPending ? "Adding" : "Add to roster"}
                    </Button>
                    {addMutation.isError && <span className="ml-3 text-sm text-rose-600">Failed to add member.</span>}
                </div>
            </form>

            <div className="mt-6 space-y-2">
                {rosterQuery.isError && <p className="text-sm text-rose-600">Could not load roster.</p>}
                {rosterQuery.data && rosterQuery.data.length === 0 && (
                    <EmptyState title="Roster empty" description="Add participants to build out this team." />
                )}
                {rosterQuery.data && rosterQuery.data.length > 0 && (
                    <ul className="divide-y divide-slate-200">
                        {rosterQuery.data.map((member) => (
                            <li key={member.id} className="flex items-center justify-between py-3 text-sm text-slate-600">
                                <div>
                                    <p className="font-medium text-slate-800">Participant #{member.participant_id}</p>
                                    <p className="text-xs text-slate-500">
                                        Role: {member.role || "player"} • Jersey: {member.jersey_number || "-"}
                                    </p>
                                </div>
                                <Button
                                    variant="danger"
                                    onClick={() => removeMutation.mutate({ teamId, memberId: member.id })}
                                    disabled={removeMutation.isPending}
                                >
                                    Remove
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Card>
    );
}
