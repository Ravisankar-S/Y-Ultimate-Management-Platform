import React, { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import Button from "../../components/common/Button.jsx";

export default function AdminHeader({ onToggleNotifications, onToggleSidebar, notificationCount = 0, displayName }) {
	const logout = useAuthStore((state) => state.logout);
	const role = useAuthStore((state) => state.role ?? "admin");
	const [open, setOpen] = useState(false);

	const displayRole = role.charAt(0).toUpperCase() + role.slice(1);
	const subtitle = role === "coach"
		? "Track coaching sessions, attendance, and athlete progress."
		: "Manage tournaments, teams, participants and live operations.";
	const profileLabel = displayName ?? displayRole;

	return (
		<header className="border-b border-slate-200 bg-white">
			<div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => onToggleSidebar?.()}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
						aria-label="Toggle navigation"
					>
						☰
					</button>
					<div>
					<h1 className="text-2xl font-semibold text-slate-900">{displayRole} Console</h1>
					<p className="text-sm text-slate-500">{subtitle}</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={onToggleNotifications}
						className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
						aria-label="Open notifications"
					>
						<span aria-hidden="true" className="text-lg">🔔</span>
						{notificationCount > 0 && (
							<span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
								{notificationCount}
							</span>
						)}
					</button>
					<div className="relative">
						<button
							type="button"
							onClick={() => setOpen((prev) => !prev)}
							className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
						>
							<span aria-hidden="true">👤</span>
							<span>{profileLabel}</span>
							<span aria-hidden="true" className="text-slate-400">▾</span>
						</button>
						{open && (
							<div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
								<button
									type="button"
									className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-600 hover:bg-slate-50"
									onClick={() => {
										setOpen(false);
										// placeholder for change password flow
										alert("Change password flow coming soon");
									}}
								>
									<span aria-hidden="true">🔐</span>
									<span>Change password</span>
								</button>
								<Button
									variant="danger"
									className="m-3 w-[calc(100%-1.5rem)]"
									onClick={() => {
										setOpen(false);
										logout();
									}}
								>
									Logout
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
