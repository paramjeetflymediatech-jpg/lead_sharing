"use client";

import { useState, useRef, useEffect } from "react";
import {
    UserCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    LockClosedIcon,
    CameraIcon,
    CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const fileInputRef = useRef(null);

    // Form states
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        profileImage: "",
        address: {
            line1: "",
            city: "",
            postcode: ""
        },
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Fetch user data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/me");
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user;
                    // Parse name back to first/last
                    const nameParts = (user.name || "").split(" ");
                    const firstName = nameParts[0] || "";
                    const lastName = nameParts.slice(1).join(" ") || "";

                    setFormData(prev => ({
                        ...prev,
                        firstName,
                        lastName,
                        email: user.email || "",
                        phone: user.phone || "",
                        profileImage: user.profile_image || "",
                        address: {
                            line1: user.address_line1 || "",
                            city: user.city || "",
                            postcode: user.postcode || ""
                        }
                    }));
                    if (user.profile_image) {
                        setAvatar(user.profile_image);
                    }
                }
            } catch (error) {
                toast.error("Failed to load profile");
            } finally {
                setInitialLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Use the existing upload API
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setAvatar(data.url); // Update preview
                // Also update the form data so it gets saved on submit
                setFormData(prev => ({
                    ...prev,
                    profileImage: data.url
                }));
                toast.success("Profile picture uploaded");
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Error uploading picture");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Profile updated successfully!");
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Profile Settings</h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Manage your personal information and security preferences.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Avatar Section */}
                    <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <UserCircleIcon className="w-6 h-6 text-blue-600" />
                            Public Profile
                        </h2>
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                            <div className="relative group cursor-pointer shrink-0" onClick={handleAvatarClick}>
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 ring-4 ring-white dark:ring-zinc-800 shadow-lg">
                                    {avatar ? (
                                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-4xl font-bold">
                                            {formData.firstName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="w-8 h-8 text-white" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Info */}
                    <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <LockClosedIcon className="w-6 h-6 text-blue-600" />
                            Account Security
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-800/50 border-none rounded-lg text-gray-500 cursor-not-allowed"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckBadgeIcon className="w-5 h-5 text-green-500" title="Verified" />
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Email cannot be changed directly for security reasons.</p>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Change Password</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="Current Password"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                    />
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="New Password"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                    />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm New Password"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPinIcon className="w-6 h-6 text-blue-600" />
                            Address Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address Line 1</label>
                                <input
                                    type="text"
                                    name="address.line1"
                                    value={formData.address.line1}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            {/* Line 2 removed for simplicity or can be added if backend supports it */}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <input
                                    type="text"
                                    name="address.city"
                                    value={formData.address.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postcode</label>
                                <input
                                    type="text"
                                    name="address.postcode"
                                    value={formData.address.postcode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-2 focus:ring-blue-500 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4">
                        <button
                            type="button"
                            className="w-full sm:w-auto px-6 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
