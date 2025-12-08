import React, { useState } from "react";
import CreateParticipant from "./CreateParticipant.jsx";
import ParticipantList from "./ParticipantList.jsx";
import ParticipantDetails from "./ParticipantDetails.jsx";
import Card from "../../common/Card.jsx";

export default function ParticipantManagement({ canManage = true }) {
    const [selectedParticipantId, setSelectedParticipantId] = useState(null);

    return (
        <div className="space-y-6">
            {canManage ? (
                <CreateParticipant />
            ) : (
                <Card title="Participant directory" subtitle="Browse registered athletes & volunteers">
                    <p className="text-sm text-slate-600">
                        Coaches can view participant profiles and drill into attendance history. Reach out to an admin for roster changes.
                    </p>
                </Card>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
                <ParticipantList
                    onSelectParticipant={(id) => setSelectedParticipantId(id)}
                    selectedId={selectedParticipantId}
                />
                <ParticipantDetails participantId={selectedParticipantId} />
            </div>
        </div>
    );
}
