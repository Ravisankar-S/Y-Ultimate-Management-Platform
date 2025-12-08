import api from "./axiosInstance";

export const fetchGlobalAnalytics = async () => {
    const res = await api.get("/analytics/overview");
    return res.data;
};

export const fetchTournamentAnalytics = async (tournamentId) => {
    if (!tournamentId) return null;
    const res = await api.get(`/analytics/tournaments/${tournamentId}`);
    return res.data;
};
