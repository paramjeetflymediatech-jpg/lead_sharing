"use client";

import { useState, useEffect } from "react";
import { Send, ArrowLeft, MessageCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/tradesperson/conversations");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC]"></div>
            </div>
        );
    }

    return (
        <div className="w-full  bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    {/* <Link
                        href="/tradesperson"
                        className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-[#155DFC] dark:hover:text-blue-400 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link> */}
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
                        Messages
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Communicate with homeowners about job opportunities
                    </p>
                </div>

                {/* Messages List */}
                {conversations.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
                            <MessageCircle className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                            No messages yet
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                            Start bidding on jobs to begin conversations with homeowners
                        </p>
                        <Link
                            href="/tradesperson"
                            className="inline-block mt-6 px-6 py-3 bg-[#155DFC] text-white rounded-xl font-semibold hover:bg-[#155DFC]/90 transition-all"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-lg">
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {conversations.map((conversation) => (
                                <Link
                                    key={conversation.id}
                                    href={`/tradesperson/messages/${conversation.id}`}
                                    className="block hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            {conversation.homeownerProfileImage ? (
                                                <img
                                                    src={conversation.homeownerProfileImage}
                                                    alt={conversation.homeownerName}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-zinc-800 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                                                    {conversation.homeownerName?.charAt(0).toUpperCase() || "?"}
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-1">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                        {conversation.homeownerName || "Unknown User"}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 ml-2">
                                                        <Clock className="w-3 h-3" />
                                                        {formatTime(conversation.lastMessageTime)}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-500 truncate">
                                                    {conversation.lastMessage || "No messages yet"}
                                                </p>
                                            </div>

                                            {/* Unread Badge */}
                                            {conversation.unreadCount > 0 && (
                                                <div className="flex-shrink-0">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-[#155DFC] text-white text-xs font-bold rounded-full">
                                                        {conversation.unreadCount}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
