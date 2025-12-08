import api from "./axiosInstance";

export const fetchTeams = async (tournamentId, params = {}) => {
    if (!tournamentId) return [];
    const searchParams = new URLSearchParams();
    if (params.status) {
        searchParams.set("status", params.status);
    }
    const query = searchParams.toString();
    const res = await api.get(`/tournaments/${tournamentId}/teams/${query ? `?${query}` : ""}`);
    return res.data;
};

export const approveTeam = async (teamId) => {
    const res = await api.patch(`/tournaments/teams/${teamId}/approve`);
    return res.data;
};

export const deleteTeam = async (teamId) => {
    await api.delete(`/tournaments/teams/${teamId}`);
};

export const fetchTeamRoster = async (teamId) => {
    if (!teamId) return [];
    const res = await api.get(`/teams/${teamId}/roster`);
    return res.data;
};

export const addTeamMembers = async ({ teamId, members }) => {
    const res = await api.post(`/teams/${teamId}/roster`, members);
    return res.data;
};

export const removeTeamMember = async ({ teamId, memberId }) => {
    await api.delete(`/teams/${teamId}/roster/${memberId}`);
};
