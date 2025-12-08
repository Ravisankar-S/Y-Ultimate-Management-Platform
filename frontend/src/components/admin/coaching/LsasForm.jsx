import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { recordLsasAssessment } from "../../../api/coaching.js";
import Button from "../../common/Button.jsx";

const initialState = {
    participant_id: "",
    date: "",
    scores_json: "{\"communication\": 0, \"spirit\": 0}",
    notes: "",
};

export default function LsasForm() {
    const [form, setForm] = useState(initialState);
    const [error, setError] = useState(null);

    const mutation = useMutation({
        mutationFn: ({ participantId, payload }) => recordLsasAssessment({ participantId, payload }),
        onSuccess: () => {
            setForm(initialState);
            setError(null);
        },
        onError: () => setError("Unable to save LSAS assessment"),
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.participant_id || !form.date) return;
        try {
            const scores = JSON.parse(form.scores_json || "{}");
            mutation.mutate({
                participantId: Number(form.participant_id),
                payload: {
                    participant_id: Number(form.participant_id),
                    date: form.date,
                    scores_json: scores,
                    notes: form.notes,
                },
            });
        } catch (err) {
            setError("Scores JSON is invalid");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">LSAS Assessment</h2>
                <p className="text-sm text-slate-500">Capture leadership and soft skills evaluations.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">
                    Participant ID
                    <input
                        name="participant_id"
                        required
                        value={form.participant_id}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Assessment date
                    <input
                        type="date"
                        name="date"
                        required
                        value={form.date}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="md:col-span-2 text-sm font-medium text-slate-600">
                    Scores (JSON)
                    <textarea
                        name="scores_json"
                        rows={3}
                        value={form.scores_json}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="md:col-span-2 text-sm font-medium text-slate-600">
                    Notes
                    <textarea
                        name="notes"
                        rows={3}
                        value={form.notes}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving" : "Save"}
                </Button>
                {error && <span className="text-sm text-rose-600">{error}</span>}
                {mutation.isSuccess && !error && <span className="text-sm text-emerald-600">Assessment recorded.</span>}
            </div>
        </form>
    );
}
