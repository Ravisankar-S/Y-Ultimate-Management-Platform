import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTeams, approveTeam } from "../../../api/teams.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Badge from "../../common/Badge.jsx";
import Button from "../../common/Button.jsx";
import TeamApproval from "./TeamApproval.jsx";

export default function TeamList({ tournamentId, selectedTeamId, onSelectTeam, canManage = true }) {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["teams", tournamentId],
        queryFn: () => fetchTeams(tournamentId),
        enabled: Boolean(tournamentId),
    });

    const approveMutation = useMutation({
        mutationFn: approveTeam,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams", tournamentId] }),
    });

    if (!tournamentId) {
        return <EmptyState title="Select a tournament" description="Pick a tournament to manage its teams." />;
    }

    if (isLoading) {
        return <LoadingState label="Loading teams" />;
    }

    if (isError) {
        return (
            <Card title="Teams">
                <p className="text-sm text-rose-600">Unable to load teams. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyState title="No teams yet" description="Teams will appear here once registered." />;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.map((team) => (
                <Card
                    key={team.id}
                    title={team.name}
                    subtitle={`Status: ${team.status}`}
                    className={selectedTeamId === team.id ? "border-blue-500" : ""}
                    actions={<Badge variant={team.status === "approved" ? "success" : "warning"}>{team.status}</Badge>}
                >
                    <div className="flex items-center justify-between gap-3">
                        <Button variant="secondary" onClick={() => onSelectTeam(team.id)}>
                            {selectedTeamId === team.id ? "Selected" : "Open roster"}
                        </Button>
                        {canManage ? (
                            <TeamApproval
                                status={team.status}
                                onApprove={() => approveMutation.mutate(team.id)}
                                isApproving={approveMutation.isPending && approveMutation.variables === team.id}
                            />
                        ) : (
                            <span className="text-xs font-medium uppercase text-slate-400">Admin approval required</span>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
}
