import React from "react";

export default function LoadingState({ label = "Loading..." }) {
    return (
        <div className="flex items-center justify-center py-10 text-slate-500">
            <div className="flex items-center gap-3">
                <span className="h-3 w-3 animate-ping rounded-full bg-blue-500" />
                <span className="text-sm font-medium">{label}</span>
            </div>
        </div>
    );
}
