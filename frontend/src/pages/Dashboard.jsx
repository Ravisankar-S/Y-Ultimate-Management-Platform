import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "../layout/admin/AdminLayout.jsx";
import AdminHeader from "../layout/admin/AdminHeader.jsx";
import AdminSidebar from "../layout/admin/AdminSidebar.jsx";
import AnalyticsDashboard from "../components/admin/analytics/AnalyticsDashboard.jsx";
import TournamentManagement from "../components/admin/tournaments/TournamentManagement.jsx";
import TeamManagement from "../components/admin/teams/TeamManagement.jsx";
import ParticipantManagement from "../components/admin/participants/ParticipantManagement.jsx";
import MatchManagement from "../components/admin/matches/MatchManagement.jsx";
import SpiritScoresTable from "../components/admin/spirit/SpiritScoresTable.jsx";
import Leaderboard from "../components/admin/leaderboard/Leaderboard.jsx";
import MediaManagement from "../components/admin/media/MediaManagement.jsx";
import CoachingModule from "../components/admin/coaching/CoachingModule.jsx";
import ExportButtons from "../components/admin/export/ExportButtons.jsx";
import NotificationsPanel from "../components/admin/notifications/NotificationsPanel.jsx";
import Card from "../components/common/Card.jsx";
import { fetchTournaments } from "../api/tournaments.js";
import { fetchNotifications } from "../api/notifications.js";
import { fetchCurrentUser } from "../api/auth.js";
import { useAuthStore } from "../store/useAuthStore";

const ALL_SECTIONS = [
    "overview",
    "tournaments",
    "teams",
    "participants",
    "matches",
    "spirit",
    "leaderboard",
    "analytics",
    "media",
    "coaching",
    "export",
];

const ROLE_SECTION_MAP = {
    admin: ALL_SECTIONS,
    manager: ALL_SECTIONS,
    coach: [
        "coaching",
        "tournaments",
        "teams",
        "participants",
        "matches",
        "analytics",
        "leaderboard",
        "overview",
    ],
    guest: ["coaching"],
    default: ALL_SECTIONS,
};

export default function Dashboard() {
    const token = useAuthStore((state) => state.token);
    const role = useAuthStore((state) => state.role);
    const setRole = useAuthStore((state) => state.setRole);

    const normalizedRole = role ?? "guest";
    const canManageSystem = normalizedRole === "admin" || normalizedRole === "manager";
    const canApproveTeams = canManageSystem;
    const canCreateParticipants = canManageSystem;
    const canCreateTournaments = canManageSystem;
    const canManageMatches = canManageSystem;
    const allowedSections = useMemo(
        () => ROLE_SECTION_MAP[normalizedRole] ?? ROLE_SECTION_MAP.default,
        [normalizedRole]
    );

    const [activeSection, setActiveSection] = useState(() => allowedSections[0] ?? "coaching");
    const [selectedTournamentId, setSelectedTournamentId] = useState(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { data: currentUser } = useQuery({
        queryKey: ["auth", "me"],
        queryFn: fetchCurrentUser,
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (currentUser?.role && currentUser.role !== role) {
            setRole(currentUser.role);
        }
    }, [currentUser, role, setRole]);

    useEffect(() => {
        if (!allowedSections.includes(activeSection)) {
            setActiveSection(allowedSections[0] ?? "coaching");
        }
    }, [allowedSections, activeSection]);

    const { data: tournaments } = useQuery({
        queryKey: ["tournaments"],
        queryFn: fetchTournaments,
    });

    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        staleTime: 30000,
        enabled: Boolean(token),
    });

    useEffect(() => {
        if (!selectedTournamentId && tournaments && tournaments.length > 0) {
            setSelectedTournamentId(tournaments[0].id);
        }
    }, [tournaments, selectedTournamentId]);

    const notificationCount = useMemo(
        () => (notifications || []).filter((notification) => !notification.is_read).length,
        [notifications]
    );

    const headerDisplayName = currentUser?.username ?? role ?? undefined;

    const handleSidebarSelect = (section) => {
        setNotificationsOpen(false);
        setActiveSection(section);
        setSidebarOpen(false);
    };

    const renderSection = () => {
        if (!allowedSections.includes(activeSection)) {
            return (
                <Card title="Restricted" subtitle="This area requires administrator privileges.">
                    <p className="text-sm text-slate-600">Contact an administrator if you need elevated access.</p>
                </Card>
            );
        }

        switch (activeSection) {
            case "overview":
                return (
                    <div className="space-y-6">
                        <AnalyticsDashboard
                            selectedTournamentId={selectedTournamentId}
                            onSelectTournament={setSelectedTournamentId}
                            tournaments={tournaments || []}
                        />
                    </div>
                );
            case "tournaments":
                return (
                    <TournamentManagement
                        selectedTournamentId={selectedTournamentId}
                        onSelectTournament={setSelectedTournamentId}
                        onNavigateSection={(section) => {
                            setActiveSection(section);
                        }}
                        canManage={canCreateTournaments}
                    />
                );
            case "teams":
                return <TeamManagement tournamentId={selectedTournamentId} canManage={canApproveTeams} />;
            case "participants":
                return <ParticipantManagement canManage={canCreateParticipants} />;
            case "matches":
                return <MatchManagement tournamentId={selectedTournamentId} canManage={canManageMatches} />;
            case "spirit":
                return <SpiritScoresTable tournamentId={selectedTournamentId} />;
            case "leaderboard":
                return <Leaderboard tournamentId={selectedTournamentId} />;
            case "analytics":
                return (
                    <AnalyticsDashboard
                        selectedTournamentId={selectedTournamentId}
                        onSelectTournament={setSelectedTournamentId}
                        tournaments={tournaments || []}
                    />
                );
            case "media":
                return <MediaManagement tournamentId={selectedTournamentId} />;
            case "coaching":
                return <CoachingModule />;
            case "export":
                return <ExportButtons tournamentId={selectedTournamentId} />;
            default:
                return null;
        }
    };

    return (
        <AdminLayout
            header={
                <AdminHeader
                    onToggleNotifications={() => setNotificationsOpen((prev) => !prev)}
                    onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
                    notificationCount={notificationCount}
                    displayName={headerDisplayName}
                />
            }
            sidebar={
                <AdminSidebar
                    active={activeSection}
                    onSelect={handleSidebarSelect}
                    allowedSections={allowedSections}
                />
            }
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={setSidebarOpen}
        >
            {renderSection()}
            <NotificationsPanel
                isOpen={notificationsOpen}
                onClose={() => {
                    setNotificationsOpen(false);
                }}
            />
        </AdminLayout>
    );
}