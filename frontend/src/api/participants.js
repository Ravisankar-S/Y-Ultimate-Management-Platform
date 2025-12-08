import api from "./axiosInstance";

export const fetchParticipants = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : "";
    const res = await api.get(`/participants/${suffix}`);
    return res.data;
};

export const fetchParticipant = async (participantId) => {
    if (!participantId) return null;
    const res = await api.get(`/participants/${participantId}`);
    return res.data;
};

export const createParticipant = async (payload) => {
    const res = await api.post("/participants/", payload);
    return res.data;
};

export const deleteParticipant = async (participantId) => {
    await api.delete(`/participants/${participantId}`);
};
