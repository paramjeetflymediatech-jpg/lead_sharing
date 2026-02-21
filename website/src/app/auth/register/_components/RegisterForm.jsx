"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";


function RegisterFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [role, setRole] = useState("HOMEOWNER");
    const [name, setName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Validation states
    const [fieldErrors, setFieldErrors] = useState({
        name: "",
        companyName: "",
        email: "",
        password: ""
    });
    const [touched, setTouched] = useState({
        name: false,
        companyName: false,
        email: false,
        password: false
    });

    useEffect(() => {
        const roleQuery = searchParams.get("role");
        if (roleQuery === "TRADESPERSON" || roleQuery === "HOMEOWNER") {
            setRole(roleQuery);
        }
    }, [searchParams]);

    // Validation functions
    const validateName = (value) => {
        if (!value.trim()) {
            return "Name is required";
        }
        if (value.trim().length < 2) {
            return "Name must be at least 2 characters";
        }
        if (value.trim().length > 100) {
            return "Name must be less than 100 characters";
        }
        if (!/^[a-zA-Z\s'-]+$/.test(value)) {
            return "Name can only contain letters, spaces, hyphens, and apostrophes";
        }
        return "";
    };

    const validateCompanyName = (value) => {
        if (role === "TRADESPERSON") {
            if (!value.trim()) {
                return "Company name is required";
            }
            if (value.trim().length < 2) {
                return "Company name must be at least 2 characters";
            }
            if (value.trim().length > 150) {
                return "Company name must be less than 150 characters";
            }
        }
        return "";
    };

    const validateEmail = (value) => {
        if (!value.trim()) {
            return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return "Please enter a valid email address";
        }
        if (value.length > 255) {
            return "Email must be less than 255 characters";
        }
        return "";
    };

    const validatePassword = (value) => {
        if (!value) {
            return "Password is required";
        }
        if (value.length < 6) {
            return "Password must be at least 6 characters";
        }
        if (value.length > 128) {
            return "Password must be less than 128 characters";
        }
        // Optional: Check for password strength
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return "Password must contain uppercase, lowercase, and number";
        }
        return "";
    };

    // Handle field blur (when user leaves a field)
    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });

        let error = "";
        switch (field) {
            case "name":
                error = validateName(name);
                break;
            case "companyName":
                error = validateCompanyName(companyName);
                break;
            case "email":
                error = validateEmail(email);
                break;
            case "password":
                error = validatePassword(password);
                break;
            default:
                break;
        }

        setFieldErrors({ ...fieldErrors, [field]: error });
    };

    // Handle input changes with validation
    const handleNameChange = (e) => {
        const value = e.target.value;
        setName(value);
        if (touched.name) {
            setFieldErrors({ ...fieldErrors, name: validateName(value) });
        }
    };

    const handleCompanyNameChange = (e) => {
        const value = e.target.value;
        setCompanyName(value);
        if (touched.companyName) {
            setFieldErrors({ ...fieldErrors, companyName: validateCompanyName(value) });
        }
    };

    const handleEmailChange = (e) => {
        const value = e.target.value.toLowerCase();
        setEmail(value);
        if (touched.email) {
            setFieldErrors({ ...fieldErrors, email: validateEmail(value) });
        }
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setPassword(value);
        if (touched.password) {
            setFieldErrors({ ...fieldErrors, password: validatePassword(value) });
        }
    };

    // Validate entire form
    const validateForm = () => {
        const errors = {
            name: validateName(name),
            companyName: validateCompanyName(companyName),
            email: validateEmail(email),
            password: validatePassword(password)
        };

        setFieldErrors(errors);
        setTouched({
            name: true,
            companyName: true,
            email: true,
            password: true
        });

        // Check if there are any errors
        return !Object.values(errors).some(error => error !== "");
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Validate form before submission
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        setLoading(true);

        const body = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role
        };

        if (role === "TRADESPERSON") {
            body.companyName = companyName.trim();
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            toast.success("Account created successfully! Welcome aboard!");
            router.push("/auth/login");
        } catch (err) {
            toast.error(err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // Check if form is valid for submit button state
    const isFormValid = () => {
        const nameValid = validateName(name) === "";
        const emailValid = validateEmail(email) === "";
        const passwordValid = validatePassword(password) === "";
        const companyNameValid = role === "TRADESPERSON"
            ? validateCompanyName(companyName) === ""
            : true;

        return nameValid && emailValid && passwordValid && companyNameValid;
    };

    return (
        <div className="relative flex flex-1 w-full flex-col items-center justify-center px-4 py-12 overflow-hidden">

            {/* Unique UI element: Decorative Background Blur */}
            <div className="absolute -bottom-[10%] -right-[10%] h-[300px] w-[300px] rounded-full bg-[#155DFC] opacity-10 blur-[100px]" />
            <div className="absolute -top-[5%] -left-[5%] h-[200px] w-[200px] rounded-full bg-[#155DFC] opacity-5 blur-[80px]" />

            <div className="relative z-10 w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-black">
                        Get <span className="text-[#155DFC]">Started</span>
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        {role === "HOMEOWNER"
                            ? "Find the best pros for your home project."
                            : "Grow your trade business with quality leads."}
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-zinc-100 bg-white/80 p-8 shadow-2xl shadow-[#155DFC]/5 backdrop-blur-xl transition-colors"
                >
                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Unique UI: Custom Role Switcher */}
                        <div className="flex rounded-xl bg-zinc-100 p-1">
                            <button
                                type="button"
                                onClick={() => setRole("HOMEOWNER")}
                                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${role === "HOMEOWNER"
                                    ? "bg-white text-[#155DFC] shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                    }`}
                            >
                                Homeowner
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("TRADESPERSON")}
                                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${role === "TRADESPERSON"
                                    ? "bg-white text-[#155DFC] shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                                    }`}
                            >
                                Tradesperson
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {/* Name Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                    Full Name
                                </label>
                                <input
                                    required
                                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${touched.name && fieldErrors.name
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-zinc-200 bg-white focus:border-[#155DFC] focus:ring-[#155DFC]/10"
                                        }`}
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={handleNameChange}
                                    onBlur={() => handleBlur("name")}
                                />
                                {touched.name && fieldErrors.name && (
                                    <p className="text-xs text-red-600 ml-1 mt-1">
                                        {fieldErrors.name}
                                    </p>
                                )}
                            </div>

                            {/* Company Name Field (for Tradesperson) */}
                            {role === "TRADESPERSON" && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                        Company Name
                                    </label>
                                    <input
                                        required
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${touched.companyName && fieldErrors.companyName
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                            : "border-zinc-200 bg-white focus:border-[#155DFC] focus:ring-[#155DFC]/10"
                                            }`}
                                        placeholder="Enter company name"
                                        value={companyName}
                                        onChange={handleCompanyNameChange}
                                        onBlur={() => handleBlur("companyName")}
                                    />
                                    {touched.companyName && fieldErrors.companyName && (
                                        <p className="text-xs text-red-600 ml-1 mt-1">
                                            {fieldErrors.companyName}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Email Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                    Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 ${touched.email && fieldErrors.email
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                        : "border-zinc-200 bg-white focus:border-[#155DFC] focus:ring-[#155DFC]/10"
                                        }`}
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    onBlur={() => handleBlur("email")}
                                />
                                {touched.email && fieldErrors.email && (
                                    <p className="text-xs text-red-600 ml-1 mt-1">
                                        {fieldErrors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 ml-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-4 pr-10 ${touched.password && fieldErrors.password
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                                            : "border-zinc-200 bg-white focus:border-[#155DFC] focus:ring-[#155DFC]/10"
                                            }`}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onBlur={() => handleBlur("password")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {touched.password && fieldErrors.password && (
                                    <p className="text-xs text-red-600 ml-1 mt-1">
                                        {fieldErrors.password}
                                    </p>
                                )}
                                {!fieldErrors.password && password && (
                                    <p className="text-xs text-zinc-500 ml-1 mt-1">
                                        Must be 6+ characters with uppercase, lowercase, and number
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isFormValid()}
                            className="group relative mt-4 w-full overflow-hidden rounded-xl bg-[#155DFC] py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? "Creating Account..." : "Create Account"}
                                {!loading && <span className="transition-transform group-hover:translate-x-1">→</span>}
                            </span>
                        </button>
                    </div>
                </form>

                {/* Links */}
                <div className="mt-8 flex flex-col items-center gap-4 text-sm font-medium">
                    <p className="text-zinc-500">
                        Already have an account?{" "}
                        <a href="/auth/login" className="text-[#155DFC] hover:underline underline-offset-4">
                            Log in here
                        </a>
                    </p>
                    <a href="/" className="text-zinc-400 transition-colors hover:text-black">
                        ← Back to homepage
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function RegisterForm() {
    return (
        <Suspense fallback={<div className="flex flex-1 items-center justify-center">Loading...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}
