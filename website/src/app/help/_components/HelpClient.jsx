"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Search, MessageCircle } from "lucide-react";

const faqData = {
    general: [
        {
            q: "What is All Care Pros?",
            a: "All Care Pros is a platform that connects homeowners with trusted, local tradespeople. We make it easy to post jobs, get quotes, and hire professionals for any home improvement project."
        },
        {
            q: "Is it free to use?",
            a: "Yes! For homeowners, it is completely free to post jobs and receive quotes. Tradespeople pay a small fee to access leads or contact homeowners."
        },
        {
            q: "Are the tradespeople verified?",
            a: "Yes, we verify all tradespeople on our platform. We check their identity, business details, and insurance to ensure you're hiring a professional."
        }
    ],
    homeowner: [
        {
            q: "How do I post a job?",
            a: "Simply click on the 'Post a Job' button, select the type of trade you need, describe your project, and add any photos. It takes less than 2 minutes."
        },
        {
            q: "How many quotes will I receive?",
            a: "You typically receive up to 3-5 quotes from interested tradespeople. This gives you enough options to compare prices without being overwhelmed."
        },
        {
            q: "Can I leave a review?",
            a: "Absolutely. After a job is completed, we encourage you to leave a review. This helps the tradesperson build their reputation and helps other homeowners make informed decisions."
        }
    ],
    tradesperson: [
        {
            q: "How do I get leads?",
            a: "Once you sign up and set your preferences (trade type and location), you'll see a list of relevant jobs in your area. You can then choose which ones to purchase or quote for."
        },
        {
            q: "Is there a monthly fee?",
            a: "We offer both pay-as-you-go and subscription options. You can choose the plan that best suits your business needs."
        },
        {
            q: "What documents do I need to sign up?",
            a: "To get verified, you'll need to provide proof of identity, business registration (if applicable), and public liability insurance documents."
        }
    ],
    payments: [
        {
            q: "How do I pay the tradesperson?",
            a: "You pay the tradesperson directly. We do not handle payments for the actual work. You can agree on payment terms (cash, bank transfer, etc.) directly with them."
        },
        {
            q: "Are my payments protected?",
            a: "Since payments are made directly to the tradesperson, they are not covered by us. We recommend asking for a receipt and using traceable payment methods like bank transfers."
        }
    ]
};

export default function HelpClient() {
    const [activeTab, setActiveTab] = useState("general");
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Header */}
            <div className="bg-[#1149C7] text-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6">How can we help?</h1>
                    {/* <div className="relative max-w-xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            className="w-full px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg"
                        />
                        <button className="absolute right-2 top-2 bg-[#1149C7] p-2 rounded-full hover:bg-blue-700 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                    </div> */}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Tabs */}
                    <div className="md:w-1/4">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-8">
                            {[
                                { id: "general", label: "General" },
                                { id: "homeowner", label: "For Homeowners" },
                                { id: "tradesperson", label: "For Tradespeople" },
                                { id: "payments", label: "Payments & Billing" }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setOpenFaqIndex(null);
                                    }}
                                    className={`w-full text-left px-6 py-4 font-medium transition-colors border-b last:border-0 ${activeTab === tab.id
                                        ? "bg-blue-50 text-[#1149C7] border-blue-100"
                                        : "text-gray-600 hover:bg-gray-50 border-gray-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="md:w-3/4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                            {activeTab === 'payments' ? 'Payments & Billing' : activeTab + ' Questions'}
                        </h2>

                        <div className="space-y-4">
                            {faqData[activeTab].map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    >
                                        <span className="font-bold text-gray-900">{faq.q}</span>
                                        {openFaqIndex === index ? (
                                            <ChevronUp className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                    {openFaqIndex === index && (
                                        <div className="px-6 pb-6 text-gray-600 animate-fadeIn bg-gray-50/50">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Contact Support */}
                        <div className="mt-12 bg-[#1149C7]/5 border border-[#1149C7]/20 rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
                            <p className="text-gray-600 mb-6">
                                Can't find the answer you're looking for? Our support team is here to help.
                            </p>
                            <Link 
                                href="/contact-support"
                                className="inline-block bg-[#1149C7] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#0D3A99] transition-colors"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
