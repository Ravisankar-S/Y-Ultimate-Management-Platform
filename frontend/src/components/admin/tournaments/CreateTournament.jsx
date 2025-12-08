import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTournament } from "../../../api/tournaments.js";
import Button from "../../common/Button.jsx";
import Modal from "../../common/Modal.jsx";

const initialState = {
    title: "",
    slug: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    sponsor: "",
    is_published: true,
};

export default function CreateTournament() {
    const [form, setForm] = useState(initialState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createTournament,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tournaments"] });
            setForm(initialState);
            setIsModalOpen(false);
            setFeedback("success");
        },
        onError: () => {
            setFeedback(null);
        },
    });

    const onSubmit = (event) => {
        event.preventDefault();
        setFeedback(null);
        mutation.mutate({
            ...form,
            start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
            end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
        });
    };

    const onChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
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
                        <h2 className="text-lg font-semibold text-slate-900">Create Tournament</h2>
                        <p className="text-sm text-slate-500">Spin up a new event in seconds.</p>
                    </div>
                    <Button type="button" onClick={openModal}>
                        New tournament
                    </Button>
                </div>
                {feedback === "success" && (
                    <p className="mt-4 text-sm text-emerald-600">Tournament created and synced.</p>
                )}
            </div>

            <Modal
                title="Create Tournament"
                description="Spin up a new event in seconds."
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Title
                            <input
                                name="title"
                                required
                                value={form.title}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Slug
                            <input
                                name="slug"
                                required
                                value={form.slug}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Start Date
                            <input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            End Date
                            <input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Location
                            <input
                                name="location"
                                value={form.location}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Sponsor
                            <input
                                name="sponsor"
                                value={form.sponsor}
                                onChange={onChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-slate-600">
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            rows={3}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                        />
                    </label>

                    <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            name="is_published"
                            checked={form.is_published}
                            onChange={onChange}
                            className="h-4 w-4 rounded border-slate-300"
                        />
                        Publish immediately
                    </label>

                    {mutation.isError && (
                        <p className="text-sm text-rose-600">Failed to create tournament. Please verify inputs.</p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving..." : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
