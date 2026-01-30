"use client";

import { useState } from "react";
import { ChevronDownIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";

export default function HelpPage() {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: "How do I buy leads?",
            answer: "You can browse available leads in the 'Explore Jobs' section. Click on a job to see partial details. To view contact information, you'll need to use credits. Click 'Unlock Lead' to spend credits and get full access."
        },
        {
            question: "How do credits work?",
            answer: "Credits are the currency used to unlock leads. Each lead has a credit cost. You can purchase credit packs from your account dashboard. Credits do not expire as long as your account is active."
        },
        {
            question: "What happens if a lead is fake?",
            answer: "We verify phone numbers where possible. If you find a lead has invalid contact details, you can report it within 24 hours via the lead details page for a credit refund investigation."
        },
        {
            question: "Can I get a refund for unused credits?",
            answer: "Generally, credits are non-refundable once purchased. However, if you believe there has been an error or you are closing your account, please contact support for assistance."
        }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Frequently asked questions and support</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* FAQs */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            <button
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                className="w-full flex items-center justify-between p-4 text-left font-bold text-gray-800 dark:text-gray-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                {faq.question}
                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === index && (
                                <div className="p-4 pt-0 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Box */}
                <div className="lg:col-span-1">
                    <div className="bg-[#1149C7] rounded-xl p-6 text-white text-center shadow-lg shadow-blue-900/20 sticky top-24">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                        <p className="text-white/80 text-sm mb-6">Our support team is available Mon-Fri, 9am - 5pm to assist you.</p>

                        <a href="mailto:support@leadsharing.com" className="block w-full bg-white text-[#1149C7] font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors mb-3">
                            Email Support
                        </a>
                        <button className="block w-full border border-white/30 text-white font-bold py-3 rounded-lg hover:bg-white/10 transition-colors text-sm">
                            Live Chat (Offline)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
