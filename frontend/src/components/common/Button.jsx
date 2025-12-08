import React from "react";

const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50",
};

export default function Button({ variant = "primary", className = "", children, ...rest }) {
    const styles = variantStyles[variant] || variantStyles.primary;
    return (
        <button
            className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${styles} ${className}`}
            {...rest}
        >
            {children}
        </button>
    );
}
