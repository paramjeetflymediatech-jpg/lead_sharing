// "use client";

// import { useState, useEffect } from "react";
// import { useSearchParams } from "next/navigation";

// export default function RegisterPage() {
//   const searchParams = useSearchParams();
//   const [role, setRole] = useState("HOMEOWNER");
//   const [name, setName] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const roleQuery = searchParams.get("role");
//     if (roleQuery === "TRADESPERSON" || roleQuery === "HOMEOWNER") {
//       setRole(roleQuery);
//     }
//   }, [searchParams]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     const body = { name, email, password, role };
//     if (role === "TRADESPERSON") body.companyName = companyName;

//     const res = await fetch("/api/auth/register", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     if (!res.ok) {
//       const data = await res.json().catch(() => ({}));
//       setError(data.message || "Registration failed");
//       return;
//     }

//     window.location.href = "/";
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm"
//       >
//         <h1 className="mb-4 text-xl font-semibold">Create account</h1>
//         {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
//         <label className="mb-2 block text-sm font-medium">
//           I am a
//           <select
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//           >
//             <option value="HOMEOWNER">Homeowner</option>
//             <option value="TRADESPERSON">Tradesperson</option>
//           </select>
//         </label>
//         <label className="mb-2 block text-sm font-medium">
//           Name
//           <input
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//           />
//         </label>
//         {role === "TRADESPERSON" && (
//           <label className="mb-2 block text-sm font-medium">
//             Company name
//             <input
//               className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//               value={companyName}
//               onChange={(e) => setCompanyName(e.target.value)}
//             />
//           </label>
//         )}
//         <label className="mb-2 block text-sm font-medium">
//           Email
//           <input
//             type="email"
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </label>
//         <label className="mb-4 block text-sm font-medium">
//           Password
//           <input
//             type="password"
//             className="mt-1 w-full rounded border border-zinc-300 px-3 py-2 text-sm"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </label>
//         <button
//           type="submit"
//           className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
//         >
//           Sign up
//         </button>
//         <a
//           href="/auth/login"
//           className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
//         >
//           Already have an account? Log in /
//         </a>
//         <a
//           href="/"
//           className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
//         >
//           / Back to home
//         </a>
//       </form>
//     </div>
//   );
// }



"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState("HOMEOWNER");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleQuery = searchParams.get("role");
    if (roleQuery === "TRADESPERSON" || roleQuery === "HOMEOWNER") {
      setRole(roleQuery);
    }
  }, [searchParams]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = { name, email, password, role };
    if (role === "TRADESPERSON") body.companyName = companyName;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Registration failed");
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-white px-4 py-12 transition-colors dark:bg-[#000000] overflow-hidden">
      
      {/* Unique UI element: Decorative Background Blur */}
      <div className="absolute -bottom-[10%] -right-[10%] h-[300px] w-[300px] rounded-full bg-[#155DFC] opacity-10 blur-[100px]" />
      <div className="absolute -top-[5%] -left-[5%] h-[200px] w-[200px] rounded-full bg-[#155DFC] opacity-5 blur-[80px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
            Get <span className="text-[#155DFC]">Started</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {role === "HOMEOWNER" 
              ? "Find the best pros for your home project." 
              : "Grow your trade business with quality leads."}
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl shadow-[#155DFC]/5 backdrop-blur-xl transition-colors dark:border-zinc-800 dark:bg-zinc-900/50"
        >
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Unique UI: Custom Role Switcher */}
            <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setRole("HOMEOWNER")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  role === "HOMEOWNER" 
                  ? "bg-white text-[#155DFC] shadow-sm dark:bg-zinc-700 dark:text-white" 
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Homeowner
              </button>
              <button
                type="button"
                onClick={() => setRole("TRADESPERSON")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  role === "TRADESPERSON" 
                  ? "bg-white text-[#155DFC] shadow-sm dark:bg-zinc-700 dark:text-white" 
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400"
                }`}
              >
                Tradesperson
              </button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                  Full Name
                </label>
                <input
                  required
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {role === "TRADESPERSON" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                    Company Name
                  </label>
                  <input
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="Business Name Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                  Email Address
                </label>
                <input
                  required
                  type="email"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 ml-1">
                  Password
                </label>
                <input
                  required
                  type="password"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#155DFC] focus:ring-4 focus:ring-[#155DFC]/10 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-4 w-full overflow-hidden rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? "Processing..." : "Create Account"}
                {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
              </span>
            </button>
          </div>
        </form>

        {/* Links */}
        <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
          <p className="text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <a href="/auth/login" className="text-[#155DFC] hover:underline underline-offset-4">
              Log in here
            </a>
          </p>
          <a href="/" className="text-zinc-400 transition-colors hover:text-black dark:hover:text-white">
            ← Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center dark:bg-black dark:text-white">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}