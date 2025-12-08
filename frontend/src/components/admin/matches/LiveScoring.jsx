import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMatch, updateMatchScore } from "../../../api/matches.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import Button from "../../common/Button.jsx";
import useWebSocket from "../../../hooks/useWebSocket.js";

const resolveWsBase = () => {
    if (import.meta.env.VITE_WS_BASE_URL) return import.meta.env.VITE_WS_BASE_URL;
    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return apiBase.replace("http", "ws");
};

export default function LiveScoring({ matchId }) {
    const queryClient = useQueryClient();
    const [scores, setScores] = useState({ score_a: 0, score_b: 0, status: "scheduled" });

    const { data, isLoading } = useQuery({
        queryKey: ["match", matchId],
        queryFn: () => fetchMatch(matchId),
        enabled: Boolean(matchId),
        onSuccess: (match) => {
            if (match) {
                setScores({
                    score_a: match.score_a ?? 0,
                    score_b: match.score_b ?? 0,
                    status: match.status ?? "scheduled",
                });
            }
        },
    });

    const mutation = useMutation({
        mutationFn: ({ matchId: id, payload }) => updateMatchScore({ matchId: id, payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["matches"] });
            queryClient.invalidateQueries({ queryKey: ["match", matchId] });
        },
    });

    const wsUrl = useMemo(() => {
        if (!matchId) return null;
        const base = resolveWsBase();
        return `${base}/ws/matches/${matchId}`;
    }, [matchId]);

    useWebSocket(wsUrl, {
        enabled: Boolean(matchId),
        onMessage: (message) => {
            if (typeof message === "object" && message !== null) {
                setScores((prev) => ({
                    ...prev,
                    score_a: Number(message.score_a ?? prev.score_a),
                    score_b: Number(message.score_b ?? prev.score_b),
                    status: message.status || prev.status,
                }));
            }
        },
    });

    useEffect(() => {
        if (data) {
            setScores({
                score_a: data.score_a ?? 0,
                score_b: data.score_b ?? 0,
                status: data.status ?? "scheduled",
            });
        }
    }, [data]);

    if (!matchId) {
        return null;
    }

    if (isLoading) {
        return <LoadingState label="Loading match" />;
    }

    const adjustScore = (key, delta) => {
        setScores((prev) => ({
            ...prev,
            [key]: Math.max(0, (prev[key] ?? 0) + delta),
        }));
    };

    const submitScores = (status) => {
        mutation.mutate({
            matchId,
            payload: { ...scores, status },
        });
    };

    return (
        <Card title="Live Scoring" subtitle={`Match #${matchId}`}>
            <div className="grid gap-6 md:grid-cols-2">
                {(["score_a", "score_b"]).map((key) => (
                    <div key={key} className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-6">
                        <p className="text-sm font-semibold uppercase text-slate-500">{key === "score_a" ? "Team A" : "Team B"}</p>
                        <div className="mt-3 flex items-center gap-3 text-3xl font-semibold text-slate-900">
                            <button
                                type="button"
                                className="h-10 w-10 rounded-full border border-slate-300 text-center text-xl"
                                onClick={() => adjustScore(key, -1)}
                            >
                                -
                            </button>
                            <span>{scores[key]}</span>
                            <button
                                type="button"
                                className="h-10 w-10 rounded-full border border-slate-300 text-center text-xl"
                                onClick={() => adjustScore(key, 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button onClick={() => submitScores("ongoing")} disabled={mutation.isPending}>
                    Update live score
                </Button>
                <Button variant="outline" onClick={() => submitScores("completed")} disabled={mutation.isPending}>
                    Finalize match
                </Button>
                <span className="text-sm text-slate-500">Status: {scores.status}</span>
                {mutation.isError && <span className="text-sm text-rose-600">Failed to update score.</span>}
                {mutation.isSuccess && <span className="text-sm text-emerald-600">Score updated.</span>}
            </div>
        </Card>
    );
}
