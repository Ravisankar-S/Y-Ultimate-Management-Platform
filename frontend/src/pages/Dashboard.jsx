import React from "react";
import { useAuthStore } from "../store/useAuthStore";

export default function Dashboard() {
    const logout = useAuthStore((s) => s.logout);
    return (
        <div className="p-6">
            <h1 className="text-4xl mb-4"> Admin Dashboard</h1>
            <p> Welcome - Authentication Successfull!</p>
            <button onClick={logout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
                Logout
            </button>
        </div>
    );
}