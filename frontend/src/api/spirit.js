import api from "./axiosInstance";

export const fetchSpiritScores = async (tournamentId) => {
    const res = await api.get("/matches/");
    const matches = res.data || [];
    if (!tournamentId) return matches;
    return matches.filter((match) => match.tournament_id === tournamentId);
};
