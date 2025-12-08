import React from "react";

export default function AdminLayout({ header, sidebar, children, isSidebarOpen = false, onToggleSidebar }) {
	const closeSidebar = () => onToggleSidebar?.(false);

	return (
		<div className="min-h-screen bg-slate-100">
			{header}
			<div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6">
				<div className="flex flex-col gap-6 lg:flex-row">
					{sidebar && (
						<aside className="hidden w-52 flex-shrink-0 lg:sticky lg:top-24 lg:block">
							<div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
								{sidebar}
							</div>
						</aside>
					)}
					<main className="flex-1 space-y-8">{children}</main>
				</div>
			</div>

			{sidebar && (
				<>
					<div
						className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-200 ease-out lg:hidden ${
							isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
						}`}
						onClick={closeSidebar}
					/>
					<div
						className={`fixed inset-y-0 left-0 z-50 w-64 max-w-full transform bg-white shadow-xl transition-transform duration-200 ease-out lg:hidden ${
							isSidebarOpen ? "translate-x-0" : "-translate-x-full"
						}`}
					>
						<div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
							<h2 className="text-sm font-semibold text-slate-700">Navigation</h2>
							<button
								type="button"
								onClick={closeSidebar}
								className="rounded-full border border-transparent p-2 text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-slate-700"
								aria-label="Close menu"
							>
								✕
							</button>
						</div>
						<div className="px-4 py-4">
							<div className="space-y-4">
								{sidebar}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
