import api from "./axiosInstance";

const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const exportTournament = async (tournamentId) => {
    const res = await api.get(`/tournaments/${tournamentId}/export`, {
        responseType: "blob",
    });
    const disposition = res.headers["content-disposition"] || "";
    const filename = disposition.split("filename=")[1]?.replaceAll('"', "") || `tournament-${tournamentId}.csv`;
    downloadBlob(res.data, filename);
};

export const exportAllTournaments = async () => {
    const res = await api.get("/tournaments/export-all", {
        responseType: "blob",
    });
    const disposition = res.headers["content-disposition"] || "";
    const filename = disposition.split("filename=")[1]?.replaceAll('"', "") || "tournaments.csv";
    downloadBlob(res.data, filename);
};
