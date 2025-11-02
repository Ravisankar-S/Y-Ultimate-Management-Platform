import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { login as apiLogin } from "../api/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const setToken = useAuthStore((s) => s.setToken);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiLogin({ username, password });
      // data.access_token expected
      setToken(data.access_token);
      qc.clear(); // clear react-query caches if any (optional)
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white shadow-md rounded p-6">
        <h2 className="text-2xl mb-4">Admin Login</h2>

        <label className="block mb-2">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-4">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </label>

        {error && <div className="text-red-500 mb-2">{error}</div>}

        <button type="submit" className="w-full py-2 rounded bg-blue-600 text-white">
          Login
        </button>
      </form>
    </div>
  );
}
