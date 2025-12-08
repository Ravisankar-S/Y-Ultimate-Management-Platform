import React from "react";
import Button from "../../common/Button.jsx";

export default function TeamApproval({ status, onApprove, isApproving }) {
    if (status === "approved") {
        return <span className="text-xs font-semibold uppercase text-emerald-600">Approved</span>;
    }

    return (
        <Button variant="primary" onClick={onApprove} disabled={isApproving}>
            {isApproving ? "Approving" : "Approve"}
        </Button>
    );
}
