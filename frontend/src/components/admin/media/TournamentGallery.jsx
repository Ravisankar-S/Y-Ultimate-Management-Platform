import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTournamentGallery, deleteMedia } from "../../../api/media.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";
import { formatDateTime } from "../../../utils/format.js";

const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return `${base}${url}`;
};

export default function TournamentGallery({ tournamentId }) {
    const queryClient = useQueryClient();
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["gallery", tournamentId],
        queryFn: () => fetchTournamentGallery(tournamentId),
        enabled: Boolean(tournamentId),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMedia,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery", tournamentId] }),
    });

    if (!tournamentId) {
        return null;
    }

    if (isLoading) {
        return <LoadingState label="Loading gallery" />;
    }

    if (isError) {
        return (
            <Card title="Gallery">
                <p className="text-sm text-rose-600">Failed to load gallery. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return <EmptyState title="No media" description="Upload photos or videos for this tournament." />;
    }

    return (
        <Card title="Tournament Gallery" subtitle="Latest uploads">
            <div className="grid gap-4 sm:grid-cols-2">
                {data.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="aspect-video overflow-hidden rounded-lg bg-slate-100">
                            {item.mime?.startsWith("video") ? (
                                <video src={resolveMediaUrl(item.url)} controls className="h-full w-full object-cover" />
                            ) : (
                                <img src={resolveMediaUrl(item.url)} alt={item.caption || "Tournament media"} className="h-full w-full object-cover" />
                            )}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{item.caption || "Untitled"}</p>
                        <p className="text-xs text-slate-500">Uploaded {formatDateTime(item.created_at)}</p>
                        <Button
                            variant="danger"
                            className="mt-3"
                            onClick={() => deleteMutation.mutate(item.id)}
                            disabled={deleteMutation.isPending}
                        >
                            Delete
                        </Button>
                    </div>
                ))}
            </div>
        </Card>
    );
}
