"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { UserCircleIcon } from "@heroicons/react/24/solid";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [profile, setProfile] = useState({
        companyName: "",
        email: "",
        phone: "",
        bio: "",
        skills: "",
        serviceAreas: "",
        profileImage: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/tradesperson/profile");
            const data = await res.json();
            if (data.success) {
                setProfile({
                    ...data.data,
                    email: data.data.user?.email || data.data.email || "", // Handle populated user email or direct field if we add it
                    skills: data.data.skills ? data.data.skills.join(", ") : "",
                    serviceAreas: data.data.serviceAreas ? data.data.serviceAreas.join(", ") : ""
                });
            } else {
                toast.error(data.message || "Failed to load profile");
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            toast.error("An error occurred while loading profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Updated to match your Cloudinary upload endpoint
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (res.ok) {
                setProfile(prev => ({ ...prev, profileImage: data.url }));
                toast.success("Photo uploaded!");
                // Optionally save immediately
            } else {
                toast.error(data.message || "Upload failed");
            }
        } catch (error) {
            console.error("Upload Error:", error);
            toast.error("Error uploading photo");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/tradesperson/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully!");
            } else {
                toast.error(data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("An error occurred while updating profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1149C7]"></div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your public tradesperson profile</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Profile Header */}
                        <div className="flex items-center gap-6 mb-8">
                            <div className="relative h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden group">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserCircleIcon className="h-16 w-16 text-zinc-400" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Photo</h3>
                                <p className="text-sm text-gray-500 mb-3">Upload a professional photo to build trust.</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="profile-upload"
                                    onChange={handleFileChange}
                                    disabled={isUploading}
                                />
                                <label
                                    htmlFor="profile-upload"
                                    className={`text-sm font-bold text-[#1149C7] hover:underline cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isUploading ? 'Uploading...' : 'Change Photo'}
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Company Name</label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={profile.companyName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. ABC Plumbing Services"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    readOnly
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-gray-100 text-gray-500 dark:bg-zinc-800/50 dark:border-zinc-700 outline-none cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all"
                                    placeholder="e.g. 07700 900000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Bio</label>
                            <textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Describe your experience and services..."
                            />
                            <p className="text-xs text-gray-500 text-right">{profile.bio.length} characters</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Skills (comma separated)</label>
                            <input
                                type="text"
                                name="skills"
                                value={profile.skills}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Plumbing, Boiler Repair, tiling"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700 dark:text-zinc-300">Service Areas (comma separated)</label>
                            <input
                                type="text"
                                name="serviceAreas"
                                value={profile.serviceAreas}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 bg-white dark:bg-zinc-800 dark:border-zinc-700 focus:ring-2 focus:ring-[#1149C7] focus:border-transparent outline-none transition-all"
                                placeholder="e.g. London, Manchester, Birmingham"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        </div>
    );
}
