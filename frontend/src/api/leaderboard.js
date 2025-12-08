import api from "./axiosInstance";

export const fetchLeaderboard = async (tournamentId) => {
    if (!tournamentId) return [];
    const res = await api.get(`/tournaments/${tournamentId}/leaderboard`);
    return res.data;
};
