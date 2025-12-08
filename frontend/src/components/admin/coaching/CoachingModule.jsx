import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSessions } from "../../../api/coaching.js";
import CreateSession from "./CreateSession.jsx";
import SessionList from "./SessionList.jsx";
import AttendancePage from "./AttendancePage.jsx";
import HomeVisitForm from "./HomeVisitForm.jsx";
import LsasForm from "./LsasForm.jsx";
import CoachingAnalytics from "./CoachingAnalytics.jsx";

const tabs = [
    { id: "overview", label: "Overview" },
    { id: "sessions", label: "Sessions" },
    { id: "attendance", label: "Attendance" },
    { id: "home", label: "Home Visits" },
    { id: "lsas", label: "LSAS" },
];

export default function CoachingModule() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("overview");

    const {
        data: sessions = [],
        isFetching: sessionsLoading,
    } = useQuery({
        queryKey: ["coaching-sessions"],
        queryFn: fetchSessions,
        staleTime: 60_000,
    });

    const renderActiveContent = () => {
        switch (activeTab) {
            case "sessions":
                return (
                    <div className="space-y-6">
                        <CreateSession
                            onSessionCreated={() =>
                                queryClient.invalidateQueries({ queryKey: ["coaching-sessions"] })
                            }
                        />
                        <SessionList sessions={sessions} isLoading={sessionsLoading} />
                    </div>
                );
            case "attendance":
                return <AttendancePage />;
            case "home":
                return <HomeVisitForm />;
            case "lsas":
                return <LsasForm />;
            case "overview":
            default:
                return (
                    <div className="space-y-6">
                        <SessionList
                            sessions={sessions}
                            isLoading={sessionsLoading}
                            title="Recent Sessions"
                            subtitle="Browse the latest coaching session records"
                        />
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 sm:gap-3">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-xl px-3 py-2 text-sm font-medium transition sm:px-4 ${
                            activeTab === tab.id
                                ? "bg-blue-600 text-white shadow"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <CoachingAnalytics />

            <div className="space-y-6">{renderActiveContent()}</div>
        </div>
    );
}
