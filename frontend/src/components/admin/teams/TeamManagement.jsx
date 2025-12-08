import React, { useEffect, useState } from "react";
import TeamList from "./TeamList.jsx";
import TeamRoster from "./TeamRoster.jsx";

export default function TeamManagement({ tournamentId, canManage = true }) {
    const [selectedTeamId, setSelectedTeamId] = useState(null);

    useEffect(() => {
        setSelectedTeamId(null);
    }, [tournamentId]);

    return (
        <div className="space-y-6">
            <TeamList
                tournamentId={tournamentId}
                selectedTeamId={selectedTeamId}
                onSelectTeam={(id) => setSelectedTeamId(id)}
                canManage={canManage}
            />
            <TeamRoster teamId={selectedTeamId} />
        </div>
    );
}
