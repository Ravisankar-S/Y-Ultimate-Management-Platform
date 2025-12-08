import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoachingAnalytics } from "../../../api/coaching.js";
import Card from "../../common/Card.jsx";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";

export default function CoachingAnalytics() {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["coaching", "analytics"],
        queryFn: fetchCoachingAnalytics,
    });

    if (isLoading) {
        return <LoadingState label="Loading coaching analytics" />;
    }

    if (isError) {
        return (
            <Card title="Coaching analytics">
                <p className="text-sm text-rose-600">Failed to fetch analytics. <button onClick={() => refetch()} className="underline">Retry</button></p>
            </Card>
        );
    }

    if (!data) {
        return <EmptyState title="No analytics" description="Run coaching programs to gather analytics." />;
    }

    return (
        <Card title="Coaching Overview" subtitle="High-level training metrics">
            <dl className="grid gap-4 md:grid-cols-2 text-sm text-slate-600">
                <div>
                    <dt className="font-medium text-slate-500">Total sessions</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.total_sessions}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-500">Attendance records</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.total_attendances}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-500">Attendance rate</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.attendance_rate_percent}%</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-500">Average LSAS score</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.avg_lsas_score}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-500">Home visits</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.total_home_visits}</dd>
                </div>
                <div>
                    <dt className="font-medium text-slate-500">Participants</dt>
                    <dd className="text-lg font-semibold text-slate-900">{data.total_participants}</dd>
                </div>
            </dl>
        </Card>
    );
}
