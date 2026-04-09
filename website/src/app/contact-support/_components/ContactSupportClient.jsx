"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactSupportClient() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        category: "General Support",
        subject: "",
        message: ""
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSubmitted(true);
                toast.success("Message sent successfully!");
            } else {
                toast.error(data.error || "Failed to send message");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("An error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
                    <p className="text-gray-600 mb-8 text-lg">
                        Your message has been received. Our support team will get back to you within 24-48 hours.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-[#1149C7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0D3A99] transition-all transform hover:scale-105"
                    >
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            {/* Hero Section */}
            <div className="bg-[#1149C7] text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Contact Support</h1>
                    <p className="text-xl md:text-2xl opacity-90 font-medium">
                        Need help? Our team is here to support you.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16 -mt-10">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                                <Mail className="w-6 h-6 text-[#1149C7]" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
                            <p className="text-gray-600 mb-4">Direct support for any query.</p>
                            <a href="mailto:support@allcarepros.com" className="text-[#1149C7] font-bold hover:underline">
                                support@allcarepros.com
                            </a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
                            <p className="text-gray-600 mb-4">Mon-Fri from 9am to 6pm.</p>
                            <a href="tel:+18001234567" className="text-gray-900 font-bold hover:text-[#1149C7] transition-colors">
                                +1 (800) 123-4567
                            </a>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                                <MapPin className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
                            <p className="text-gray-600 mb-4">Our headquarters in Toronto.</p>
                            <p className="text-gray-900 font-medium">
                                123 Business Way, Suite 400<br />
                                Toronto, ON M5V 2N2
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-50">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">Send us a message</h2>
                            
                            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="John Doe"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1149C7] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="john@example.com"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1149C7] transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Topic</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1149C7] transition-all"
                                    >
                                        <option>General Support</option>
                                        <option>Account Access</option>
                                        <option>Billing & Payments</option>
                                        <option>Business/Partner Inquiry</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                    <input
                                        required
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="How can we help?"
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1149C7] transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                                    <textarea
                                        required
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        rows="6"
                                        placeholder="Tell us more about your inquiry..."
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#1149C7] transition-all resize-none"
                                    ></textarea>
                                </div>

                                <div className="md:col-span-2 mt-4">
                                    <button
                                        disabled={loading}
                                        type="submit"
                                        className={`w-full bg-[#1149C7] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-[#0D3A99] shadow-lg shadow-blue-500/20"
                                            }`}
                                    >
                                        {loading ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <span>Send Message</span>
                                                <Send className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-gray-400 text-sm mt-4">
                                        By submitting this form, you agree to our Privacy Policy.
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
