import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchNotifications,
    markNotificationRead,
    deleteNotification,
    clearNotifications,
} from "../../../api/notifications.js";
import LoadingState from "../../common/LoadingState.jsx";
import EmptyState from "../../common/EmptyState.jsx";
import Button from "../../common/Button.jsx";
import { formatDateTime } from "../../../utils/format.js";

export default function NotificationsPanel({ isOpen, onClose }) {
    const queryClient = useQueryClient();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        enabled: isOpen,
    });

    const readMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const clearMutation = useMutation({
        mutationFn: clearNotifications,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    if (!isOpen) {
        return null;
    }

    const notifications = data ?? [];
    const hasItems = notifications.length > 0;

    return (
        <div className="fixed inset-y-0 right-0 z-30 w-full max-w-lg overflow-y-auto border-l border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
                    <p className="text-sm text-slate-500">Review approvals and system alerts from across the platform.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => clearMutation.mutate()}
                        disabled={!hasItems || clearMutation.isPending}
                    >
                        {clearMutation.isPending ? "Clearing" : "Clear all"}
                    </Button>
                    <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-100"
                    >
                        Close
                    </button>
                </div>
            </div>

            <div>
                {isLoading ? (
                    <LoadingState label="Loading notifications" />
                ) : isError ? (
                    <div className="rounded-xl border border-slate-200 bg-rose-50 p-4 text-sm text-rose-600">
                        Failed to load notifications. Please try again.
                    </div>
                ) : !hasItems ? (
                    <EmptyState title="No notifications" description="You are all caught up!" />
                ) : (
                    <ul className="space-y-3">
                        {notifications.map((notification) => {
                            const prettyPayload =
                                typeof notification.payload_json === "string"
                                    ? notification.payload_json
                                    : JSON.stringify(notification.payload_json, null, 2);

                            const isRead = Boolean(notification.is_read);

                            return (
                                <li
                                    key={notification.id}
                                    className={`rounded-xl border p-4 shadow-sm transition ${
                                        isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {notification.type === "alert" ? "Action required" : "Update"}
                                            </p>
                                            <p className="text-xs text-slate-500">{formatDateTime(notification.created_at)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => deleteMutation.mutate(notification.id)}
                                            className="text-slate-400 transition hover:text-rose-500"
                                            aria-label="Dismiss notification"
                                            title="Dismiss"
                                            disabled={deleteMutation.isPending}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <pre className="mt-3 overflow-auto rounded bg-slate-900/5 p-3 text-xs text-slate-700">
                                        {prettyPayload}
                                    </pre>
                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                        <span>Status: {isRead ? "Read" : "Unread"}</span>
                                        {!isRead && (
                                            <Button
                                                variant="outline"
                                                onClick={() => readMutation.mutate(notification.id)}
                                                disabled={readMutation.isPending}
                                            >
                                                Mark as read
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
