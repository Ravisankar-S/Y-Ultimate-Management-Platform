import React from "react";
import Button from "../../common/Button.jsx";
import { exportTournament, exportAllTournaments } from "../../../api/export.js";

export default function ExportButtons({ tournamentId }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Export Data</h2>
            <p className="mt-1 text-sm text-slate-500">Download structured CSV exports for reporting and archives.</p>
            <div className="mt-4 flex flex-wrap gap-3">
                <Button
                    variant="outline"
                    disabled={!tournamentId}
                    onClick={() => tournamentId && exportTournament(tournamentId)}
                >
                    Export tournament CSV
                </Button>
                <Button variant="secondary" onClick={() => exportAllTournaments()}>
                    Export all tournaments
                </Button>
            </div>
        </div>
    );
}
