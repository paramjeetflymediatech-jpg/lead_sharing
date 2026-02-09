"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function TradespersonConversationPage() {
    const params = useParams();
    const conversationId = params.conversationId;

    const [conversation, setConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchConversation();
    }, [conversationId]);

    const fetchConversation = async () => {
        try {
            const res = await fetch(`/api/tradesperson/messages/${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setConversation(data.conversation);
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch(`/api/tradesperson/messages/${conversationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: newMessage }),
            });

            if (res.ok) {
                setNewMessage("");
                fetchConversation(); // Refresh messages
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleAcceptConversation = async () => {
        try {
            const res = await fetch(`/api/tradesperson/messages/${conversationId}`, {
                method: "PUT",
            });

            if (res.ok) {
                fetchConversation(); // Refresh to show updated status
            }
        } catch (error) {
            console.error("Error accepting conversation:", error);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC]"></div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                        Conversation not found
                    </h2>
                    <Link
                        href="/tradesperson/messages"
                        className="text-[#155DFC] hover:underline"
                    >
                        Back to messages
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-900">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/tradesperson/messages"
                        className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-[#155DFC] mb-3"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Messages
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {conversation.jobTitle || "Conversation"}
                            </h1>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                Job Status: {conversation.jobStatus}
                            </p>
                        </div>
                        {conversation.isClosed && (
                            <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-semibold rounded-full">
                                Conversation Closed
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-zinc-500 dark:text-zinc-400 py-8">
                            No messages yet
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-md px-4 py-3 rounded-2xl ${msg.isMine
                                            ? "bg-[#155DFC] text-white"
                                            : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
                                        }`}
                                >
                                    <p className="text-sm mb-1">{msg.content}</p>
                                    <p
                                        className={`text-xs ${msg.isMine ? "text-blue-100" : "text-zinc-500 dark:text-zinc-400"
                                            }`}
                                    >
                                        {formatTime(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Accept Banner */}
            {conversation.needsAcceptance && !conversation.isClosed && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            <span className="text-sm text-amber-900 dark:text-amber-200">
                                Accept this conversation to continue chatting
                            </span>
                        </div>
                        <button
                            onClick={handleAcceptConversation}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Accept Conversation
                        </button>
                    </div>
                </div>
            )}

            {/* Message Input */}
            {!conversation.isClosed && (
                <div className="bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 px-4 py-4">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-700 border-0 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-[#155DFC]"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="px-6 py-3 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                {sending ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {conversation.isClosed && (
                <div className="bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 px-4 py-4">
                    <div className="max-w-4xl mx-auto text-center text-zinc-600 dark:text-zinc-400">
                        This conversation is closed. The job has been {conversation.jobStatus.toLowerCase()}.
                    </div>
                </div>
            )}
        </div>
    );
}
