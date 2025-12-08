import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createParticipant } from "../../../api/participants.js";
import Button from "../../common/Button.jsx";
import Modal from "../../common/Modal.jsx";

const participantTypes = [
    "player",
    "coach",
    "volunteer",
    "child",
    "admin",
    "other",
];

const initialState = {
    first_name: "",
    last_name: "",
    participant_type: "player",
    primary_contact: "",
    community: "",
};

export default function CreateParticipant() {
    const [form, setForm] = useState(initialState);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createParticipant,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["participants"] });
            setForm(initialState);
            setIsModalOpen(false);
            setFeedback("success");
        },
        onError: () => {
            setFeedback(null);
        },
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFeedback(null);
        mutation.mutate(form);
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
                        <h2 className="text-lg font-semibold text-slate-900">Create Participant</h2>
                        <p className="text-sm text-slate-500">Add players, coaches or volunteers to the system.</p>
                    </div>
                    <Button type="button" onClick={openModal}>
                        New participant
                    </Button>
                </div>
                {feedback === "success" && (
                    <p className="mt-4 text-sm text-emerald-600">Participant created successfully.</p>
                )}
            </div>

            <Modal
                title="Create Participant"
                description="Add players, coaches or volunteers to the system."
                isOpen={isModalOpen}
                onClose={closeModal}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            First name
                            <input
                                name="first_name"
                                required
                                value={form.first_name}
                                onChange={handleChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Last name
                            <input
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Participant type
                            <select
                                name="participant_type"
                                value={form.participant_type}
                                onChange={handleChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            >
                                {participantTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Primary contact
                            <input
                                name="primary_contact"
                                value={form.primary_contact}
                                onChange={handleChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                        <label className="md:col-span-2 flex flex-col gap-1 text-sm font-medium text-slate-600">
                            Community / School
                            <input
                                name="community"
                                value={form.community}
                                onChange={handleChange}
                                className="rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </label>
                    </div>

                    {mutation.isError && (
                        <p className="text-sm text-rose-600">Failed to create participant. Please try again.</p>
                    )}

                    <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                        <Button type="button" variant="secondary" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Saving" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
