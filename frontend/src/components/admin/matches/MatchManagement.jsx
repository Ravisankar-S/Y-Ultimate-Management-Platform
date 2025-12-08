import React, { useState, useEffect } from "react";
import MatchCreate from "./MatchCreate.jsx";
import MatchList from "./MatchList.jsx";
import MatchSchedule from "./MatchSchedule.jsx";
import LiveScoring from "./LiveScoring.jsx";
import Card from "../../common/Card.jsx";

export default function MatchManagement({ tournamentId, canManage = true }) {
    const [activeMatchId, setActiveMatchId] = useState(null);

    useEffect(() => {
        setActiveMatchId(null);
    }, [tournamentId]);

    return (
        <div className="space-y-6">
            {canManage ? (
                <MatchCreate tournamentId={tournamentId} />
            ) : (
                <Card title="Match schedule" subtitle="View and operate live scoring">
                    <p className="text-sm text-slate-600">
                        Coaches can monitor fixtures and update live scores. Contact an admin to add or reschedule matches.
                    </p>
                </Card>
            )}
            <MatchList
                tournamentId={tournamentId}
                onSelectMatch={(id) => setActiveMatchId(id)}
                activeMatchId={activeMatchId}
            />
            <MatchSchedule tournamentId={tournamentId} />
            <LiveScoring matchId={activeMatchId} />
        </div>
    );
}
