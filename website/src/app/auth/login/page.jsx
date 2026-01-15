"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.message || "Login failed");
      return;
    }

    if (data.role === "HOMEOWNER") {
      window.location.href = "/homeowner";
    } else if (data.role === "TRADESPERSON") {
      window.location.href = "/tradesperson";
    } else {
      window.location.href = "/";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-4 text-xl font-semibold">Log in</h1>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <label className="mb-2 block text-sm font-medium">
          Email
          <input
            type="email"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Password
          <input
            type="password"
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Log in
        </button>
        <a
          href="/auth/register"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Create an account / 
        </a>
          <a
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
          / Back to home
          </a>
      </form>
    </div>
  );
}
