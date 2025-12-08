import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadTournamentMedia } from "../../../api/media.js";
import Button from "../../common/Button.jsx";

const initialState = {
    caption: "",
    is_public: true,
};

export default function MediaUpload({ tournamentId }) {
    const [form, setForm] = useState(initialState);
    const [file, setFile] = useState(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: ({ file: uploadFile, caption, is_public }) =>
            uploadTournamentMedia({ tournamentId, file: uploadFile, caption, isPublic: is_public }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["gallery", tournamentId] });
            setForm(initialState);
            setFile(null);
        },
    });

    if (!tournamentId) {
        return null;
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!file) return;
        mutation.mutate({ file, caption: form.caption, is_public: form.is_public });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Upload Tournament Media</h2>
                <p className="text-sm text-slate-500">Share highlights, photos and videos with the community.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">
                    File
                    <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(event) => setFile(event.target.files?.[0] || null)}
                        className="mt-1 w-full text-sm"
                    />
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Caption
                    <input
                        value={form.caption}
                        onChange={(event) => setForm((prev) => ({ ...prev, caption: event.target.value }))}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        checked={form.is_public}
                        onChange={(event) => setForm((prev) => ({ ...prev, is_public: event.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300"
                    />
                    Public gallery
                </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
                <Button type="submit" disabled={!file || mutation.isPending}>
                    {mutation.isPending ? "Uploading" : "Upload"}
                </Button>
                {mutation.isError && <span className="text-sm text-rose-600">Upload failed.</span>}
                {mutation.isSuccess && <span className="text-sm text-emerald-600">Media uploaded.</span>}
            </div>
        </form>
    );
}
