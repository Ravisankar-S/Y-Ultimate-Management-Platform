import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMatch, generateTournamentMatches } from "../../../api/matches.js";
import { fetchTeams } from "../../../api/teams.js";
import Button from "../../common/Button.jsx";
import Card from "../../common/Card.jsx";
import Modal from "../../common/Modal.jsx";

const initialState = {
    team_a_id: "",
    team_b_id: "",
    start_time: "",
    field_id: "",
};

export default function MatchCreate({ tournamentId }) {
    const [form, setForm] = useState(initialState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [createFeedback, setCreateFeedback] = useState(null);
    const [generateFeedback, setGenerateFeedback] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        setForm(initialState);
    }, [tournamentId]);

    const teamsQuery = useQuery({
        queryKey: ["teams", tournamentId, "approved"],
        queryFn: () => fetchTeams(tournamentId, { status: "approved" }),
        enabled: Boolean(tournamentId),
    });

    const createMutation = useMutation({
        mutationFn: (payload) => createMatch(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["schedule", tournamentId] });
            setForm(initialState);
            setIsModalOpen(false);
            setCreateFeedback("success");
        },
        onError: () => {
            setCreateFeedback(null);
        },
    });

    const generateMutation = useMutation({
        mutationFn: (id) => generateTournamentMatches(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["schedule", tournamentId] });
            setGenerateFeedback("success");
        },
        onError: () => {
            setGenerateFeedback("error");
        },
    });

    if (!tournamentId) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.team_a_id || !form.team_b_id) return;
        setCreateFeedback(null);
        createMutation.mutate({
            tournament_id: tournamentId,
            team_a_id: Number(form.team_a_id),
            team_b_id: Number(form.team_b_id),
            start_time: form.start_time ? new Date(form.start_time).toISOString() : null,
            field_id: form.field_id || null,
        });
    };

    const teams = (teamsQuery.data || []).filter((team) => team.status === "approved");

    const openModal = () => {
        createMutation.reset();
        setCreateFeedback(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        createMutation.reset();
    };

    return (
        <>
            <Card
                title="Match Management"
                subtitle="Create matches manually or auto-generate"
                actions={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={generateMutation.isPending}
                            onClick={() => {
                                setGenerateFeedback(null);
                                generateMutation.mutate(tournamentId);
                            }}
                        >
                            {generateMutation.isPending ? "Generating" : "Generate schedule"}
                        </Button>
                        <Button type="button" onClick={openModal}>
                            New match
                        </Button>
                    </>
                }
            >
                <div className="space-y-3 text-sm text-slate-600">
                    <p>Use the actions above to populate brackets quickly. Manual matches let you fine tune pairings.</p>
                    {createFeedback === "success" && (
                        <p className="text-emerald-600">Match created and schedule updated.</p>
                    )}
                    {generateFeedback === "success" && (
                        <p className="text-emerald-600">Schedule generation complete.</p>
                    )}
                    {generateFeedback === "error" && (
                        <p className="text-rose-600">Unable to generate schedule. Try again after checking team assignments.</p>
                    )}
                </div>
            </Card>

            <Modal
                title="Create Match"
                description="Pair teams and pick a kickoff time."
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-600">
                            Team A
                            <select
                                required
                                value={form.team_a_id}
                                onChange={(event) => setForm((prev) => ({ ...prev, team_a_id: event.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            >
                                <option value="">Select team</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            Team B
                            <select
                                required
                                value={form.team_b_id}
                                onChange={(event) => setForm((prev) => ({ ...prev, team_b_id: event.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            >
                                <option value="">Select team</option>
                                {teams
                                    .filter((team) => String(team.id) !== String(form.team_a_id))
                                    .map((team) => (
                                        <option key={team.id} value={team.id}>
                                            {team.name}
                                        </option>
                                    ))}
                            </select>
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            Start time
                            <input
                                type="datetime-local"
                                value={form.start_time}
                                onChange={(event) => setForm((prev) => ({ ...prev, start_time: event.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            Field
                            <input
                                value={form.field_id}
                                onChange={(event) => setForm((prev) => ({ ...prev, field_id: event.target.value }))}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                    </div>

                    {createMutation.isError && (
                        <p className="text-sm text-rose-600">Failed to create match. Please review your selections.</p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Creating" : "Create match"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
