"use client";

import { useState } from "react";

export default function APITestPage() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const testAPI = async (endpoint, method = "GET", body = null) => {
        setLoading(true);
        setResponse(null);

        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(endpoint, options);
            const data = await res.json();

            setResponse({
                status: res.status,
                statusText: res.ok ? "✅ Success" : "❌ Error",
                data: JSON.stringify(data, null, 2),
            });
        } catch (error) {
            setResponse({
                status: 500,
                statusText: "❌ Error",
                data: error.message,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">
                    📡 Messaging API Test Suite
                </h1>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Homeowner APIs */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-blue-600">
                            🏠 Homeowner APIs
                        </h2>

                        <div className="space-y-3">
                            <button
                                onClick={() => testAPI("/api/homeowner/messages")}
                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                            >
                                GET /api/homeowner/messages
                            </button>

                            <div className="space-y-2">
                                <input
                                    id="homeowner-conv-id"
                                    type="text"
                                    placeholder="Conversation ID (e.g., 1-2)"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("homeowner-conv-id").value;
                                        testAPI(`/api/homeowner/messages/${convId}`);
                                    }}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    GET /api/homeowner/messages/[id]
                                </button>
                            </div>

                            <div className="space-y-2">
                                <input
                                    id="homeowner-send-conv-id"
                                    type="text"
                                    placeholder="Conversation ID"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                />
                                <textarea
                                    id="homeowner-message"
                                    placeholder="Message content"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                    rows="2"
                                />
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("homeowner-send-conv-id").value;
                                        const message = document.getElementById("homeowner-message").value;
                                        testAPI(`/api/homeowner/messages/${convId}`, "POST", { message });
                                    }}
                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    POST Send Message
                                </button>
                            </div>

                            <div>
                                <input
                                    id="homeowner-accept-conv-id"
                                    type="text"
                                    placeholder="Conversation ID"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white mb-2"
                                />
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("homeowner-accept-conv-id").value;
                                        testAPI(`/api/homeowner/messages/${convId}`, "PUT");
                                    }}
                                    className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    PUT Accept Conversation
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tradesperson APIs */}
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-purple-600">
                            🔧 Tradesperson APIs
                        </h2>

                        <div className="space-y-3">
                            <button
                                onClick={() => testAPI("/api/tradesperson/conversations")}
                                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                            >
                                GET /api/tradesperson/conversations
                            </button>

                            <div className="space-y-2">
                                <input
                                    id="tradesperson-conv-id"
                                    type="text"
                                    placeholder="Conversation ID (e.g., 1-2)"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("tradesperson-conv-id").value;
                                        testAPI(`/api/tradesperson/messages/${convId}`);
                                    }}
                                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    GET /api/tradesperson/messages/[id]
                                </button>
                            </div>

                            <div className="space-y-2">
                                <input
                                    id="tradesperson-send-conv-id"
                                    type="text"
                                    placeholder="Conversation ID"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                />
                                <textarea
                                    id="tradesperson-message"
                                    placeholder="Message content"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white"
                                    rows="2"
                                />
                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        id="is-first-message"
                                        type="checkbox"
                                        className="w-4 h-4"
                                    />
                                    <label htmlFor="is-first-message" className="text-sm text-zinc-700 dark:text-zinc-300">
                                        Is first message (when unlocking lead)
                                    </label>
                                </div>
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("tradesperson-send-conv-id").value;
                                        const message = document.getElementById("tradesperson-message").value;
                                        const isFirstMessage = document.getElementById("is-first-message").checked;
                                        testAPI(`/api/tradesperson/messages/${convId}`, "POST", {
                                            message,
                                            isFirstMessage
                                        });
                                    }}
                                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    POST Send Message
                                </button>
                            </div>

                            <div>
                                <input
                                    id="tradesperson-accept-conv-id"
                                    type="text"
                                    placeholder="Conversation ID"
                                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white mb-2"
                                />
                                <button
                                    onClick={() => {
                                        const convId = document.getElementById("tradesperson-accept-conv-id").value;
                                        testAPI(`/api/tradesperson/messages/${convId}`, "PUT");
                                    }}
                                    className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    PUT Accept Conversation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin API */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg mb-8">
                    <h2 className="text-xl font-bold mb-4 text-red-600">
                        🔐 Admin APIs
                    </h2>
                    <button
                        onClick={() => testAPI("/api/admin/dashboard")}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                        GET /api/admin/dashboard
                    </button>
                </div>

                {/* Response Display */}
                {loading && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-zinc-600 dark:text-zinc-400">Loading...</span>
                        </div>
                    </div>
                )}

                {response && !loading && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                API Response
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                                    Status: {response.status}
                                </span>
                                <span className="text-sm font-semibold">{response.statusText}</span>
                            </div>
                        </div>
                        <pre className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-lg overflow-auto text-sm">
                            {response.data}
                        </pre>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">
                        📝 Testing Instructions
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800 dark:text-blue-300">
                        <li>Make sure you're logged in as either a homeowner or tradesperson</li>
                        <li>For conversation IDs, use format: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">jobId-userId</code></li>
                        <li>Example: If job ID is 1 and tradesperson ID is 5, use: <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">1-5</code></li>
                        <li>Test the flow: Tradesperson sends first message → Homeowner accepts & replies → Tradesperson accepts → Active chat</li>
                        <li>Check that conversation status changes: PENDING_HOMEOWNER → PENDING_TRADESPERSON → ACTIVE</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
