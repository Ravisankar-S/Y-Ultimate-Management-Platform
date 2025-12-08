import api from "./axiosInstance";

export const createSession = async (payload) => {
    const res = await api.post("/coaching/sessions/", payload);
    return res.data;
};

export const uploadHomeVisitPhotos = async ({ participantId, files }) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append("files", file);
    });

    const res = await api.post(`/media/home-visits/${participantId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const fetchSessions = async () => {
    const res = await api.get("/coaching/sessions/");
    return res.data;
};

export const markAttendance = async ({ sessionId, records }) => {
    const res = await api.post(`/coaching/sessions/${sessionId}/attendance`, records);
    return res.data;
};

export const recordHomeVisit = async ({ participantId, payload }) => {
    const res = await api.post(`/coaching/participants/${participantId}/home-visit`, payload);
    return res.data;
};

export const recordLsasAssessment = async ({ participantId, payload }) => {
    const res = await api.post(`/coaching/participants/${participantId}/lsas`, payload);
    return res.data;
};

export const fetchCoachingAnalytics = async () => {
    const res = await api.get("/coaching/analytics/coaching-overview");
    return res.data;
};
