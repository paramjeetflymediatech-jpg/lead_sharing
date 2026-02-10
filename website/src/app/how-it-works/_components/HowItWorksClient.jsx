"use client";

import { useState } from "react";

export default function HowItWorksClient() {
    const [activeTab, setActiveTab] = useState("homeowner");

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">How All Care Pros Works</h1>
                    <p className="text-xl md:text-2xl opacity-90 mb-8">
                        Whether you're a homeowner or a tradesperson, we make it easy
                    </p>

                    {/* Toggle */}
                    <div className="inline-flex bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                        <button
                            onClick={() => setActiveTab("homeowner")}
                            className={`px-8 py-3 rounded-lg font-bold transition-all ${activeTab === "homeowner"
                                ? "bg-white text-[#1149C7] shadow-lg"
                                : "text-white hover:bg-white/10"
                                }`}
                        >
                            For Homeowners
                        </button>
                        <button
                            onClick={() => setActiveTab("tradesperson")}
                            className={`px-8 py-3 rounded-lg font-bold transition-all ${activeTab === "tradesperson"
                                ? "bg-white text-[#1149C7] shadow-lg"
                                : "text-white hover:bg-white/10"
                                }`}
                        >
                            For Tradespeople
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="max-w-6xl mx-auto px-4 py-16">
                {activeTab === "homeowner" ? (
                    <div className="space-y-16 animate-fadeIn">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hire the Best in 3 Simple Steps</h2>
                            <p className="text-gray-600">From posting a job to getting it done, here is how easy it is.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gray-200 z-0"></div>

                            {/* Step 1 */}
                            <div className="relative z-10 text-center bg-white">
                                <div className="w-24 h-24 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">
                                    1
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Post a Job for Free</h3>
                                <p className="text-gray-600">
                                    Describe what you need done. Include photos and details to help tradespeople understand your project.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative z-10 text-center bg-white">
                                <div className="w-24 h-24 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">
                                    2
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Receive Quotes</h3>
                                <p className="text-gray-600">
                                    Qualified local tradespeople will review your job and send competitive quotes. Compare their profiles and reviews.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative z-10 text-center bg-white">
                                <div className="w-24 h-24 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">
                                    3
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Hire & Relax</h3>
                                <p className="text-gray-600">
                                    Choose the best pro for your needs. Once the job is done, leave a review to help the community.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <a href="/create-job" className="inline-block bg-[#1149C7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0D3A99] transition-colors shadow-lg">
                                Post a Job Now
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-16 animate-fadeIn">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Grow Your Business with Us</h2>
                            <p className="text-gray-600">Join thousands of tradespeople winning new work every day.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-white border-2 border-[#1149C7] rounded-full flex items-center justify-center text-[#1149C7] text-2xl font-bold mx-auto mb-4">
                                    1
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h3>
                                <p className="text-gray-600 text-sm">Create your professional profile and upload your credentials.</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-white border-2 border-[#1149C7] rounded-full flex items-center justify-center text-[#1149C7] text-2xl font-bold mx-auto mb-4">
                                    2
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Browse Jobs</h3>
                                <p className="text-gray-600 text-sm">View leads in your area that match your skills and trade.</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-white border-2 border-[#1149C7] rounded-full flex items-center justify-center text-[#1149C7] text-2xl font-bold mx-auto mb-4">
                                    3
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Send Quotes</h3>
                                <p className="text-gray-600 text-sm">Contact homeowners directly with your best price.</p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-white border-2 border-[#1149C7] rounded-full flex items-center justify-center text-[#1149C7] text-2xl font-bold mx-auto mb-4">
                                    4
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Get Hired</h3>
                                <p className="text-gray-600 text-sm">Win work, build your reputation, and grow your business.</p>
                            </div>
                        </div>

                        <div className="text-center mt-12">
                            <a href="/auth/register?role=TRADESPERSON" className="inline-block bg-[#1149C7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0D3A99] transition-colors shadow-lg">
                                Join as Tradesperson
                            </a>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
