import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { markAttendance } from "../../../api/coaching.js";
import Button from "../../common/Button.jsx";

const initialState = {
    session_id: "",
    participant_id: "",
    tournament_id: "",
    date: "",
    present: true,
    notes: "",
};

export default function AttendancePage() {
    const [form, setForm] = useState(initialState);

    const mutation = useMutation({
        mutationFn: ({ sessionId, record }) => markAttendance({ sessionId, records: [record] }),
        onSuccess: () => setForm(initialState),
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.session_id || !form.participant_id || !form.date) return;
        mutation.mutate({
            sessionId: Number(form.session_id),
            record: {
                participant_id: Number(form.participant_id),
                session_id: Number(form.session_id),
                tournament_id: form.tournament_id ? Number(form.tournament_id) : undefined,
                date: form.date,
                present: form.present,
                notes: form.notes,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Mark Attendance</h2>
                <p className="text-sm text-slate-500">Log attendance for sessions and tournaments.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-600">
                    Session ID
                    <input
                        name="session_id"
                        required
                        value={form.session_id}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
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
                    Tournament ID (optional)
                    <input
                        name="tournament_id"
                        value={form.tournament_id}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Date
                    <input
                        type="date"
                        name="date"
                        required
                        value={form.date}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                        type="checkbox"
                        name="present"
                        checked={form.present}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300"
                    />
                    Present
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
                {mutation.isError && <span className="text-sm text-rose-600">Failed to mark attendance.</span>}
                {mutation.isSuccess && <span className="text-sm text-emerald-600">Attendance recorded.</span>}
            </div>
        </form>
    );
}
