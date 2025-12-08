import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createSession } from "../../../api/coaching.js";
import Button from "../../common/Button.jsx";
import Modal from "../../common/Modal.jsx";

const initialState = {
    program_id: "",
    coach_id: "",
    date: "",
    location: "",
    start_time: "",
    end_time: "",
    notes: "",
    is_online: false,
};

export default function CreateSession({ onSessionCreated }) {
    const [form, setForm] = useState(initialState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const mutation = useMutation({
        mutationFn: (payload) => createSession(payload),
        onSuccess: (session) => {
            setForm(initialState);
            onSessionCreated?.(session);
            setIsModalOpen(false);
            setFeedback("success");
        },
        onError: () => {
            setFeedback(null);
        },
    });

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.date) return;
        setFeedback(null);
        mutation.mutate({
            ...form,
            program_id: form.program_id ? Number(form.program_id) : undefined,
            coach_id: form.coach_id ? Number(form.coach_id) : undefined,
        });
    };

    const openModal = () => {
        mutation.reset();
        setFeedback(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        mutation.reset();
    };

    return (
        <>
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">Create Coaching Session</h2>
                        <p className="text-sm text-slate-500">Schedule practice sessions or workshops.</p>
                    </div>
                    <Button type="button" onClick={openModal}>
                        New session
                    </Button>
                </div>
                {feedback === "success" && (
                    <p className="mt-4 text-sm text-emerald-600">Session created and shared with coaching records.</p>
                )}
            </div>

            <Modal
                title="Create Coaching Session"
                description="Schedule practice sessions or workshops."
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-sm font-medium text-slate-600">
                            Program ID
                            <input
                                name="program_id"
                                value={form.program_id}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            Coach ID
                            <input
                                name="coach_id"
                                value={form.coach_id}
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
                        <label className="text-sm font-medium text-slate-600">
                            Location
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            Start time
                            <input
                                type="time"
                                name="start_time"
                                value={form.start_time}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="text-sm font-medium text-slate-600">
                            End time
                            <input
                                type="time"
                                name="end_time"
                                value={form.end_time}
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
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                name="is_online"
                                checked={form.is_online}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            Online session
                        </label>
                    </div>

                    {mutation.isError && (
                        <p className="text-sm text-rose-600">Failed to create session. Please review the details.</p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Creating" : "Create session"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
