import api from "./axiosInstance";

export const uploadTournamentMedia = async ({ tournamentId, file, caption, isPublic = true }) => {
    const formData = new FormData();
    formData.append("file", file);
    if (caption) formData.append("caption", caption);
    formData.append("is_public", String(isPublic));

    const res = await api.post(`/media/tournaments/${tournamentId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const fetchTournamentGallery = async (tournamentId) => {
    if (!tournamentId) return [];
    const res = await api.get(`/media/tournaments/${tournamentId}/gallery`);
    return res.data;
};

export const deleteMedia = async (mediaId) => {
    await api.delete(`/media/${mediaId}`);
};
