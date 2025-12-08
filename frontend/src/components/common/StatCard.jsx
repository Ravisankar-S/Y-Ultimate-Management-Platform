import React from "react";

export default function StatCard({ label, value, icon, change, accent = "bg-blue-100 text-blue-600" }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
                    {change && (
                        <p className="mt-2 text-xs text-slate-500">{change}</p>
                    )}
                </div>
                {icon && <div className={`flex h-12 w-12 items-center justify-center rounded-full ${accent}`}>{icon}</div>}
            </div>
        </div>
    );
}
