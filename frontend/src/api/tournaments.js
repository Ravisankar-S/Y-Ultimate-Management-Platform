import api from "./axiosInstance";

export const fetchTournaments = async () => {
    const res = await api.get("/tournaments/");
    return res.data;
};

export const fetchTournament = async (tournamentId) => {
    if (!tournamentId) return null;
    const res = await api.get(`/tournaments/${tournamentId}`);
    return res.data;
};

export const createTournament = async (payload) => {
    const res = await api.post("/tournaments/", payload);
    return res.data;
};

export const deleteTournament = async (tournamentId) => {
    await api.delete(`/tournaments/${tournamentId}`);
};
