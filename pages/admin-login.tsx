// pages/admin-login.tsx
import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        toast.success("Login successful!");
        router.push("/super-secret-dashboard-98765");
      } else {
        const data = await res.json();
        toast.error(data.message || "Incorrect password!");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
      setPassword(""); // Şifreyi state'ten temizle
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Troysarl</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-800 mb-4">
              <svg
                className="w-7 h-7 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">Admin Access</h1>
            <p className="text-gray-400 text-sm mt-1">Troysarl Dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              {isLoading ? "Verifying…" : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
