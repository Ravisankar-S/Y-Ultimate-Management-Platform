import React from "react";

export default function EmptyState({ title = "No data", description }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <p className="text-base font-semibold text-slate-600">{title}</p>
            {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        </div>
    );
}
