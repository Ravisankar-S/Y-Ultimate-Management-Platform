import React from "react";
import Card from "../../common/Card.jsx";
import EmptyState from "../../common/EmptyState.jsx";

export default function SessionList({ sessions, isLoading = false, title = "Session Log", subtitle = "Recently created coaching sessions" }) {
    if (isLoading) {
        return (
            <Card title={title} subtitle={subtitle}>
                <p className="text-sm text-slate-500">Loading sessions…</p>
            </Card>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <Card title={title} subtitle={subtitle}>
                <EmptyState
                    title="No sessions recorded"
                    description="Create a session to keep track of coaching activities."
                />
            </Card>
        );
    }

    return (
        <Card title={title} subtitle={subtitle}>
            <ul className="divide-y divide-slate-200 text-sm text-slate-600">
                {sessions.map((session) => (
                    <li key={session.id || `${session.date}-${session.location}`} className="py-3">
                        <p className="font-medium text-slate-900">Session #{session.id || "pending"}</p>
                        <p className="text-xs text-slate-500">
                            {session.date} • {session.location || "Location TBD"}
                        </p>
                        {session.notes && <p className="mt-1 text-xs text-slate-500">{session.notes}</p>}
                    </li>
                ))}
            </ul>
        </Card>
    );
}
