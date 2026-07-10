"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { API_URL } from "@/config/api";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) return;

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Registration failed");
            }

            // Auto-login after successful registration
            const loginRes = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const loginData = await loginRes.json();
            login(loginData.access_token, username);
            router.push("/");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 text-white font-sans bg-[#0a0a0a]"
            style={{
                backgroundImage: "radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08), transparent 25%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.08), transparent 25%)"
            }}
        >
            <div className="w-full max-w-sm relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 transition duration-1000 group-hover:opacity-100"></div>
                <div className="relative bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-white">Create Account</h1>
                        <p className="text-zinc-400 text-sm">Join OmniAI to unleash the power of intelligence.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-300 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full bg-white hover:bg-zinc-200 text-black font-medium py-3 rounded-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? "Registering..." : "Register"}
                        </button>
                    </form>

                    <p className="text-center text-xs text-zinc-500">
                        Already have an account? <span onClick={() => router.push("/login")} className="text-blue-400 cursor-pointer hover:underline">Login here</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
