import React from "react";
import CreateTournament from "./CreateTournament.jsx";
import TournamentsList from "./TournamentsList.jsx";
import TournamentDetails from "./TournamentDetails.jsx";
import Card from "../../common/Card.jsx";

export default function TournamentManagement({
    selectedTournamentId,
    onSelectTournament,
    onNavigateSection,
    canManage = true,
}) {
    return (
        <div className="space-y-6">
            {canManage ? (
                <CreateTournament />
            ) : (
                <Card title="Tournament directory" subtitle="Viewing live tournaments">
                    <p className="text-sm text-slate-600">
                        You can browse published tournaments and drill into teams, participants, or coaching tools.
                    </p>
                </Card>
            )}
            <div className="space-y-6">
                <TournamentsList activeId={selectedTournamentId} onSelect={onSelectTournament} />
                <TournamentDetails tournamentId={selectedTournamentId} onNavigate={onNavigateSection} />
            </div>
        </div>
    );
}
