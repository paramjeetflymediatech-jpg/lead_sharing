"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState("HOMEOWNER");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const roleQuery = searchParams.get("role");
    if (roleQuery === "TRADESPERSON" || roleQuery === "HOMEOWNER") {
      setRole(roleQuery);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const body = { name, email, password, role };
    if (role === "TRADESPERSON") body.companyName = companyName;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Registration failed");
      return;
    }

    window.location.href = "/";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <h1 className="mb-4 text-xl font-semibold">Create account</h1>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <label className="mb-2 block text-sm font-medium">
          I am a
          <select
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="HOMEOWNER">Homeowner</option>
            <option value="TRADESPERSON">Tradesperson</option>
          </select>
        </label>
        <label className="mb-2 block text-sm font-medium">
          Name
          <input
            className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {role === "TRADESPERSON" && (
          <label className="mb-2 block text-sm font-medium">
            Company name
            <input
              className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </label>
        )}
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
          Sign up
        </button>
        <a
          href="/auth/login"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Already have an account? Log in /
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
