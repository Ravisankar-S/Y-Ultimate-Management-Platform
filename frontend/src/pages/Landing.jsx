import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
            <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Y Ultimate Platform</h1>
                    <p className="text-sm text-slate-500">Operations cockpit for tournaments, coaching, and community impact.</p>
                </div>
                <Link
                    to="/login"
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
                >
                    Admin Login
                </Link>
            </header>

            <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 pb-20 pt-10 lg:flex-row lg:items-center">
                <div className="lg:w-1/2">
                    <h2 className="text-4xl font-semibold text-slate-900">
                        Manage tournaments, teams, and coaching programs with clarity.
                    </h2>
                    <p className="mt-4 text-lg text-slate-600">
                        Real-time insights, streamlined approvals, and comprehensive participant management — all in one intuitive dashboard tailored for Y-Ultimate administrators.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/login"
                            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow hover:bg-blue-700"
                        >
                            Enter Admin Console
                        </Link>
                        <a
                            href="https://github.com/Ravisankar-S/Y-Ultimate-Management-Platform"
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-100"
                        >
                            View Docs
                        </a>
                    </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl lg:w-1/2">
                    <ul className="space-y-4 text-sm text-slate-600">
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5">🏆</span>
                            <span>Spin up tournaments, approve teams, and broadcast schedules instantly.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5">📊</span>
                            <span>Track leaderboards, spirit scores, and analytics powered by the FastAPI backend.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5">🎥</span>
                            <span>Organize media, send notifications, and keep stakeholders engaged.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-0.5">🧭</span>
                            <span>Centralize coaching sessions, attendance, and LSAS assessments for impactful programming.</span>
                        </li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
