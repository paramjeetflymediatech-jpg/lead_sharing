"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    PaperAirplaneIcon,
    UserCircleIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    VideoCameraIcon,
    EllipsisVerticalIcon,
    FaceSmileIcon,
    PaperClipIcon
} from "@heroicons/react/24/outline";
import Link from 'next/link';
import { toast } from "react-hot-toast";

export default function MessagesPage() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);
    const POLL_INTERVAL = 5000; // Poll every 5 seconds

    // Fetch conversations
    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch("/api/homeowner/messages");
            if (res.ok) {
                const data = await res.json();
                setConversations(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        // Optional: Poll for new conversations
        const interval = setInterval(fetchConversations, POLL_INTERVAL * 2);
        return () => clearInterval(interval);
    }, [fetchConversations]);

    // Fetch messages for selected conversation
    const fetchMessages = useCallback(async () => {
        if (!selectedConversation) return;

        // Construct conversation ID for API: otherUserId-jobId
        const conversationId = `${selectedConversation.otherUserId}-${selectedConversation.jobId}`;

        try {
            const res = await fetch(`/api/homeowner/messages/${conversationId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (selectedConversation) {
            setLoadingMessages(true);
            fetchMessages().finally(() => setLoadingMessages(false));

            // Poll for new messages in active conversation
            const interval = setInterval(fetchMessages, POLL_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [selectedConversation, fetchMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const conversationId = `${selectedConversation.otherUserId}-${selectedConversation.jobId}`;
            const res = await fetch(`/api/homeowner/messages/${conversationId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: messageInput })
            });

            if (res.ok) {
                const newMessage = await res.json(); // Assuming API returns the created message
                setMessageInput("");
                fetchMessages(); // Refresh messages immediately
                fetchConversations(); // Refresh conversation list to show latest message
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Error sending message");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-gray-50 dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-zinc-950 overflow-hidden">
            {/* Sidebar - Conversation List */}
            <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-zinc-800 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={`${conv.otherUserId}-${conv.jobId}`}
                            onClick={() => setSelectedConversation(conv)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition ${selectedConversation?.otherUserId === conv.otherUserId && selectedConversation?.jobId === conv.jobId ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                }`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                                    {conv.otherUserName?.charAt(0) || "U"}
                                </div>
                                {/* Online status indicator could go here */}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{conv.otherUserName || "Unknown User"}</h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {conv.timestamp ? new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mb-0.5 truncate">{conv.jobTitle}</p>
                                <p className={`text-sm truncate ${conv.isRead ? 'text-gray-500' : 'font-semibold text-gray-900 dark:text-white'}`}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {!conv.isRead && (
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            )}
                        </div>
                    ))}

                    {conversations.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <p>No conversations yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gray-50 dark:bg-zinc-950`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden text-gray-500 hover:text-gray-700 dark:text-zinc-400"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                    {selectedConversation.otherUserName?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white">{selectedConversation.otherUserName}</h2>
                                    <p className="text-xs text-gray-500">{selectedConversation.otherUserRole} • {selectedConversation.jobTitle}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-gray-500">
                                <button className="hover:text-blue-600 transition"><PhoneIcon className="w-5 h-5" /></button>
                                <button className="hover:text-blue-600 transition"><VideoCameraIcon className="w-5 h-5" /></button>
                                <button className="hover:text-blue-600 transition"><EllipsisVerticalIcon className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.senderId !== selectedConversation.otherUserId ? 'justify-end' : 'justify-start'}`}>
                                    {msg.senderId === selectedConversation.otherUserId && (
                                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold mr-2 mt-1">
                                            {selectedConversation.otherUserName?.charAt(0)}
                                        </div>
                                    )}
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${msg.senderId !== selectedConversation.otherUserId
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-zinc-700'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.senderId !== selectedConversation.otherUserId ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition">
                                    <PaperClipIcon className="w-5 h-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="w-full pl-4 pr-10 py-3 bg-gray-100 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <FaceSmileIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-zinc-950">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                            <div className="relative">
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-zinc-950"></div>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-600 dark:text-blue-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select a Conversation</h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                            Choose a conversation from the list to start chatting with tradespeople about your jobs.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
