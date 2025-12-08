import React from "react";

export default function SectionHeader({ title, description, actions }) {
    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
                <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
                {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
}
