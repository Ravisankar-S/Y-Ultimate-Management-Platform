import React from "react";

const items = [
    { id: "overview", label: "Overview" },
    { id: "tournaments", label: "Tournaments" },
    { id: "teams", label: "Teams" },
    { id: "participants", label: "Participants" },
    { id: "matches", label: "Matches" },
    { id: "spirit", label: "Spirit Scores" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "analytics", label: "Analytics" },
    { id: "media", label: "Media" },
    { id: "coaching", label: "Coaching" },
    { id: "export", label: "Export" },
];

export default function AdminSidebar({ active, onSelect, allowedSections }) {
    const visibleIds = allowedSections && allowedSections.length > 0
        ? new Set(allowedSections)
        : new Set(items.map((item) => item.id));
    const visibleItems = items.filter((item) => visibleIds.has(item.id));

    return (
        <nav className="flex flex-col gap-1">
            {visibleItems.map((item) => {
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition ${
                            active === item.id
                                ? "bg-blue-600 text-white shadow"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
}
