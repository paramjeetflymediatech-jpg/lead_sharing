"use client";

import { useState, useEffect } from "react";
import { TRADE_SERVICE_LINKS } from "@/constants/locations";
import Link from "next/link";
import { ChevronRightIcon, CheckBadgeIcon, MapPinIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import JobCreationForm from "./jobForm";

export default function ServiceDetailView({ location, initialData }) {
    // Perform lookup during render for SSR support (crucial for SEO/Schema)
    let selectedData = initialData || null;
    
    if (!selectedData && location) {
        const normalizedLocation = location.toLowerCase();
        for (const city of Object.values(TRADE_SERVICE_LINKS)) {
            if (city.location.toLowerCase() === normalizedLocation) {
                selectedData = city;
                break;
            }
            const serviceMatch = city.services.find(s => 
                (typeof s === 'string' ? s : s.name).toLowerCase() === normalizedLocation
            );
            if (serviceMatch) {
                selectedData = typeof serviceMatch === 'string' ? {
                    location: city.location,
                    services: city.services,
                    description: city.description,
                    seo: city.seo,
                    content: city.content,
                    faq: city.faq
                } : {
                    ...serviceMatch,
                    location: city.location,
                    allCityServices: city.services 
                };
                break;
            }
        }
    }

    const [activeFaq, setActiveFaq] = useState(null);

    const toggleFaq = (index) => {
        setActiveFaq(activeFaq === index ? null : index);
    };

    if (!selectedData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
            </div>
        );
    }

    const allServices = Object.values(TRADE_SERVICE_LINKS).flatMap(loc => 
        (loc.services || []).map(s => typeof s === 'string' ? s : s.name)
    );

    console.log(selectedData,'f')

    return (
        <div className="bg-white min-h-screen font-sans text-zinc-900">
            {/* --- PREMIUM HERO SECTION --- */}
            <section className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900 z-0">
                    <img 
                        src="/trades/painter.png" 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1149C7]/40 to-slate-900/90"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-6 animate-fadeIn">
                        <MapPinIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-white/90 text-sm font-semibold tracking-wide uppercase">
                            Available in {selectedData.location}
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-slideUp">
                        Expert <span className="text-yellow-400">{location}</span> <br className="hidden md:block" />
                        Professional Services
                    </h1>
                    
                    <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 sm:mb-10 animate-slideUp" style={{ animationDelay: '100ms' }}>
                        Connect with top-rated, vetted tradespeople in {selectedData.location}. Get free quotes and expert service today.
                    </p>

                    <div className="max-w-3xl mx-auto px-2 sm:px-0 animate-slideUp" style={{ animationDelay: '200ms' }}>
                        <JobCreationForm />
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 lg:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* --- MAIN CONTENT --- */}
                    <div className="lg:col-span-2 space-y-8 md:space-y-12">
                        {/* About Section */}
                        <div className="animate-fadeIn">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-3">
                                <WrenchScrewdriverIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#1149C7] flex-shrink-0" />
                                About Our {location} Services
                            </h2>
                            {selectedData.description && (
                                <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-100 shadow-sm mb-6 sm:mb-8 space-y-3 sm:space-y-4">
                                    {Array.isArray(selectedData.description) ? (
                                        selectedData.description.map((block, idx) => {
                                            if (block.tag === 'h2') {
                                                return <h2 key={idx} className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mt-5 sm:mt-6 mb-3 sm:mb-4">{block.text}</h2>;
                                            }
                                            if (block.tag === 'h3') {
                                                return <h3 key={idx} className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-4 sm:mt-5 mb-2 sm:mb-3">{block.text}</h3>;
                                            }
                                            if (block.tag === 'ul') {
                                                return (
                                                    <ul key={idx} className="list-disc list-inside text-base sm:text-lg text-gray-600 leading-relaxed space-y-2 mb-4">
                                                        {block.text.split('\n').filter(line => line.trim()).map((line, i) => (
                                                            <li key={i}>{line}</li>
                                                        ))}
                                                    </ul>
                                                );
                                            }
                                            if (block.tag === 'ol') {
                                                return (
                                                    <ol key={idx} className="list-decimal list-inside text-base sm:text-lg text-gray-600 leading-relaxed space-y-2 mb-4">
                                                        {block.text.split('\n').filter(line => line.trim()).map((line, i) => (
                                                            <li key={i}>{line}</li>
                                                        ))}
                                                    </ol>
                                                );
                                            }
                                            return <p key={idx} className="text-base sm:text-lg text-gray-600 leading-relaxed">{block.text}</p>;
                                        })
                                    ) : (
                                        <p className="text-base sm:text-lg text-gray-600 leading-relaxed">{selectedData.description}</p>
                                    )}
                                </div>
                            )}
                            <div className="bg-gray-50 rounded-3xl p-5 sm:p-6 md:p-10 border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                <div 
                                    className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-base sm:text-lg space-y-4 break-words"
                                    dangerouslySetInnerHTML={{ __html: selectedData.content }}
                                />
                            </div>
                        </div>

                        {/* Services Grid */}
                        {/* <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Expertise in {selectedData.location}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(selectedData.allCityServices || selectedData.services || []).map((service, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:border-[#1149C7]/30 transition-all">
                                        <CheckBadgeIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-800 font-medium">{typeof service === 'string' ? service : service.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div> */}

                        {/* FAQ Section */}
                        {selectedData.faq && selectedData.faq.length > 0 && (
                            <div className="pt-8">
                                {/* FAQ Schema */}
                                <script
                                    type="application/ld+json"
                                    dangerouslySetInnerHTML={{
                                        __html: JSON.stringify({
                                            "@context": "https://schema.org",
                                            "@type": "FAQPage",
                                            "mainEntity": selectedData.faq.map(item => ({
                                                "@type": "Question",
                                                "name": item.question,
                                                "acceptedAnswer": {
                                                    "@type": "Answer",
                                                    "text": item.answer
                                                }
                                            }))
                                        })
                                    }}
                                />
                                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#1149C7]/10 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-xl sm:text-2xl text-[#1149C7]">?</span>
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Frequently Asked Questions</h2>
                                        <p className="text-sm sm:text-base text-gray-500 mt-1">Local expertise and advice for {selectedData.location}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 sm:space-y-6 bg-white rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-100 shadow-sm">
                                    <div>
                                        <label htmlFor="faq-select" className="block text-sm font-semibold text-gray-700 mb-3">
                                            Select a common question:
                                        </label>
                                        <div className="relative">
                                            <select 
                                                id="faq-select"
                                                className="w-full appearance-none bg-gray-50 border-2 border-gray-100 text-gray-900 text-base sm:text-lg rounded-2xl focus:ring-[#1149C7] focus:border-[#1149C7] block p-3.5 sm:p-4 md:p-5 pr-12 transition-all cursor-pointer font-medium outline-none"
                                                onChange={(e) => setActiveFaq(e.target.value === "" ? null : parseInt(e.target.value))}
                                                value={activeFaq === null ? "" : activeFaq}
                                            >
                                                <option value="">Choose a question...</option>
                                                {selectedData.faq.map((item, idx) => (
                                                    <option key={idx} value={idx}>
                                                        {item.question}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 7.293 8.172 5.858 9.607l4.435 4.435z"/>
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        className={`transition-all duration-500 ease-in-out overflow-hidden ${activeFaq !== null ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        {activeFaq !== null && (
                                            <div className="bg-[#1149C7]/5 rounded-2xl p-5 sm:p-6 md:p-8 border border-[#1149C7]/10 animate-fadeIn mt-4 sm:mt-0">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1149C7] text-white flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm mt-1">A</div>
                                                    <p className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium">
                                                        {selectedData.faq[activeFaq].answer}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {/* --- SIDEBAR --- */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 space-y-6 sm:space-y-8">
                        {/* Trust Badge Card */}
                        <div className="bg-[#1149C7] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-200/50">
                            <h3 className="text-lg sm:text-xl font-bold mb-4">Why choose AllCarePros in {selectedData.location}?</h3>
                            <ul className="space-y-3 sm:space-y-4">
                                {[
                                    'Verified & Rated Professionals',
                                    'Fast, Free Quotes',
                                    'Local Neighborhood Experts',
                                    'Secure Payment Protection'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2.5 sm:gap-3">
                                        <CheckBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-white/90 font-medium text-sm sm:text-base">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="w-full mt-6 sm:mt-8 bg-white text-[#1149C7] font-bold py-3.5 sm:py-4 rounded-xl shadow-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                                Post Your Job Now
                            </button>
                        </div>

                        {/* More Locations Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Nearby Services</h3>
                            <div className="space-y-3">
                                {allServices.slice(0, 10).map((service, idx) => (
                                    <Link 
                                        key={idx}
                                        href={`/local-tradespeople/${service.toLowerCase().replace(/ /g, '-')}`}
                                        className="flex items-center justify-between group p-3 rounded-xl hover:bg-gray-50 transition-all"
                                    >
                                        <span className="text-sm text-gray-600 group-hover:text-[#1149C7] transition-colors truncate pr-4">{service}</span>
                                        <ChevronRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[#1149C7]" />
                                    </Link>
                                ))}
                            </div>
                            <Link href="/" className="mt-6 block text-center text-[#1149C7] font-bold text-sm hover:underline">
                                View all trades and locations
                            </Link>
                        </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
