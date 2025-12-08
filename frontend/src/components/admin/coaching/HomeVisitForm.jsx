import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { recordHomeVisit, uploadHomeVisitPhotos } from "../../../api/coaching.js";
import Button from "../../common/Button.jsx";

const initialState = {
    participant_id: "",
    coach_id: "",
    visit_date: "",
    notes: "",
};

export default function HomeVisitForm() {
    const [form, setForm] = useState(initialState);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [uploadedPhotos, setUploadedPhotos] = useState([]);
    const [fileInputKey, setFileInputKey] = useState(0);
    const [uploadMessage, setUploadMessage] = useState(null);

    const mutation = useMutation({
        mutationFn: ({ participantId, payload }) => recordHomeVisit({ participantId, payload }),
        onSuccess: () => {
            setForm(initialState);
            setPhotoFiles([]);
            setUploadedPhotos([]);
            setFileInputKey((prev) => prev + 1);
            setUploadMessage(null);
        },
    });

    const uploadMutation = useMutation({
        mutationFn: ({ participantId, files }) => uploadHomeVisitPhotos({ participantId, files }),
        onSuccess: (data) => {
            const photos = data?.photos ?? [];
            setUploadedPhotos(photos);
            setPhotoFiles([]);
            setFileInputKey((prev) => prev + 1);
            setUploadMessage(`${photos.length} photo${photos.length === 1 ? "" : "s"} ready to attach.`);
        },
        onError: () => {
            setUploadMessage("Failed to upload photos. Please try again.");
        },
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files || []);
        setPhotoFiles(files);
        setUploadMessage(files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected.` : null);
    };

    const handleUploadPhotos = () => {
        if (!form.participant_id) {
            setUploadMessage("Enter a participant ID before uploading photos.");
            return;
        }
        if (photoFiles.length === 0) {
            setUploadMessage("Select at least one photo to upload.");
            return;
        }
        uploadMutation.mutate({
            participantId: Number(form.participant_id),
            files: photoFiles,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!form.participant_id || !form.visit_date) return;
        mutation.mutate({
            participantId: Number(form.participant_id),
            payload: {
                participant_id: Number(form.participant_id),
                coach_id: form.coach_id ? Number(form.coach_id) : undefined,
                visit_date: form.visit_date,
                notes: form.notes,
                photos_json: uploadedPhotos.length ? JSON.stringify(uploadedPhotos) : undefined,
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Home Visit</h2>
                <p className="text-sm text-slate-500">Record community visits and follow-ups.</p>
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
                    Coach ID
                    <input
                        name="coach_id"
                        value={form.coach_id}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <label className="text-sm font-medium text-slate-600">
                    Visit date
                    <input
                        type="date"
                        name="visit_date"
                        required
                        value={form.visit_date}
                        onChange={handleChange}
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                </label>
                <div className="md:col-span-2 space-y-2 text-sm">
                    <span className="font-medium text-slate-600">Attach photos</span>
                    <input
                        key={fileInputKey}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleUploadPhotos}
                            disabled={uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? "Uploading" : "Upload photos"}
                        </Button>
                        {uploadMessage && <span className="text-xs text-slate-500">{uploadMessage}</span>}
                    </div>
                    {uploadedPhotos.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                            {uploadedPhotos.map((photo) => (
                                <li key={photo}>{photo}</li>
                            ))}
                        </ul>
                    )}
                </div>
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
                {mutation.isError && <span className="text-sm text-rose-600">Failed to record home visit.</span>}
                {mutation.isSuccess && <span className="text-sm text-emerald-600">Home visit saved.</span>}
                {uploadMutation.isError && <span className="text-sm text-rose-600">Photo upload failed.</span>}
            </div>
        </form>
    );
}
