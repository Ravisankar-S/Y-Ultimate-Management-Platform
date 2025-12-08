import React from "react";

const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-blue-100 text-blue-700",
};

export default function Badge({ children, variant = "default" }) {
    const styles = variants[variant] || variants.default;
    return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{children}</span>;
}
