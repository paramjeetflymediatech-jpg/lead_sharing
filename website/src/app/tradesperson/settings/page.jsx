"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { BellIcon, EyeIcon } from "@heroicons/react/24/outline";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        emailLeads: true,
        emailMarketing: false,
        pushLeads: true,
    });

    const handleToggle = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        toast.success("Preference updated");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Customize your application preferences</p>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                        <BellIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
                        <p className="text-sm text-gray-500">Control how and when we contact you</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">New Lead Alerts (Email)</h3>
                            <p className="text-sm text-gray-500">Receive emails when new leads match your criteria</p>
                        </div>
                        <button
                            onClick={() => handleToggle('emailLeads')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.emailLeads ? 'bg-[#1149C7]' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.emailLeads ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">New Lead Alerts (Push)</h3>
                            <p className="text-sm text-gray-500">Receive push notifications for instant updates</p>
                        </div>
                        <button
                            onClick={() => handleToggle('pushLeads')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.pushLeads ? 'bg-[#1149C7]' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.pushLeads ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Marketing Emails</h3>
                            <p className="text-sm text-gray-500">Receive tips, trends, and special offers</p>
                        </div>
                        <button
                            onClick={() => handleToggle('emailMarketing')}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifications.emailMarketing ? 'bg-[#1149C7]' : 'bg-gray-300'}`}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${notifications.emailMarketing ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Privacy */}
            <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                        <EyeIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Privacy</h2>
                        <p className="text-sm text-gray-500">Manage your profile visibility settings</p>
                    </div>
                </div>
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">
                        Your profile is currently <span className="font-bold text-emerald-600">Public</span>. Homeowners can find you in search results.
                    </p>
                    <button className="text-sm font-bold text-[#1149C7] hover:underline">
                        Need to take a break? Set account to temporary hidden
                    </button>
                </div>
            </div>
        </div>
    );
}
