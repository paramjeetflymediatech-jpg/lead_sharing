"use client";

import { useEffect, useState } from "react";
import {
    UserGroupIcon,
    BriefcaseIcon,
    ClipboardDocumentCheckIcon,
    CurrencyDollarIcon
} from "@heroicons/react/24/outline";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHomeowners: 0,
        totalTradespeople: 0,
        totalJobs: 0,
        totalLeads: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await fetch("/api/admin/dashboard");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers || 0,
            icon: UserGroupIcon,
            color: "blue",
            detail: `${stats.totalHomeowners || 0} Homeowners • ${stats.totalTradespeople || 0} Trades`
        },
        {
            title: "Total Jobs",
            value: stats.totalJobs || 0,
            icon: BriefcaseIcon,
            color: "green",
            detail: "Posted across all categories"
        },
        {
            title: "Total Leads",
            value: stats.totalLeads || 0,
            icon: ClipboardDocumentCheckIcon,
            color: "purple",
            detail: "Unlocked leads"
        },
        {
            title: "Revenue",
            value: `$${stats.revenue || 0}`,
            icon: CurrencyDollarIcon,
            color: "orange",
            detail: "Total platform revenue"
        }
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-zinc-500 mt-2">Platform overview and performance metrics.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{card.title}</p>
                                <h3 className="text-3xl font-black text-zinc-900 dark:text-white mt-2">{card.value}</h3>
                            </div>
                            <div className={`p-3 rounded-2xl bg-${card.color}-50 dark:bg-${card.color}-900/10`}>
                                <card.icon className={`w-6 h-6 text-${card.color}-600 dark:text-${card.color}-400`} />
                            </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-medium mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {card.detail}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
