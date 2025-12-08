import api from "./axiosInstance";

export const fetchMatches = async () => {
    const res = await api.get("/matches/");
    return res.data;
};

export const fetchMatch = async (matchId) => {
    if (!matchId) return null;
    const res = await api.get(`/matches/${matchId}`);
    return res.data;
};

export const createMatch = async (payload) => {
    const res = await api.post("/matches/", payload);
    return res.data;
};

export const updateMatchScore = async ({ matchId, payload }) => {
    const res = await api.patch(`/matches/${matchId}/score`, payload);
    return res.data;
};

export const deleteMatch = async (matchId) => {
    await api.delete(`/matches/${matchId}`);
};

export const generateTournamentMatches = async (tournamentId) => {
    const res = await api.post(`/matches/tournaments/${tournamentId}/generate-matches`);
    return res.data;
};

export const fetchTournamentSchedule = async (tournamentId) => {
    if (!tournamentId) return null;
    const res = await api.get(`/matches/tournaments/${tournamentId}/schedule`);
    return res.data;
};
