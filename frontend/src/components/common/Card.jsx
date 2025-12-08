import React from "react";

export default function Card({ title, subtitle, actions, children, className = "" }) {
    return (
        <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
            {(title || actions || subtitle) && (
                <div className="border-b border-slate-200 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
                            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex items-center gap-2">{actions}</div>}
                    </div>
                </div>
            )}
            <div className="px-5 py-4">{children}</div>
        </div>
    );
}
