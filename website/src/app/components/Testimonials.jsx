"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

export default function Testimonials() {
    const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

    const testimonials = [
        {
            name: "Sarah J.",
            title: "Emergency Plumbing",
            quote: "A total lifesaver on a weekend! I woke up to a burst pipe under the kitchen sink on a Saturday morning. I panicked, but posted the job on All Care Pros and had three quotes within 15 minutes. The plumber who arrived was polite, explained exactly what needed to be done, and fixed the leak without leaving a mess. Highly recommend using this site for emergencies.",
            rating: 5
        },
        {
            name: "David M.",
            title: "Electrical Work (Rewiring)",
            quote: "Finally, an electrician I can trust. I was really nervous about getting my older home rewired. I used the 'Check Credentials' feature on the site to find a fully certified sparky. The pro I hired was incredibly professional, walked me through the safety checks, and finished the job ahead of schedule. It feels great to know my home is safe.",
            rating: 5
        },
        {
            name: "Priya K.",
            title: "Carpentry & Joinery",
            quote: "Stunning craftsmanship. We wanted custom built-in shelves for our living room but didn't know where to start. We posted the project details and found a local carpenter with a portfolio that matched our style perfectly. The result is beautiful—solid wood, perfect fit, and fair pricing. It was so much easier than calling around randomly.",
            rating: 5
        },
        {
            name: "Tom H.",
            title: "Deep Cleaning (End of Tenancy)",
            quote: "Got my full deposit back! I needed a deep clean before moving out of my rental. The cleaning team I found here was amazing. They arrived on time with all their own equipment and scrubbed the place top to bottom—even the oven looks brand new. My landlord was impressed, and I got my full bond back. Thanks, All Care Pros!",
            rating: 5
        },
        {
            name: "Linda B.",
            title: "Garden Landscaping",
            quote: "Transformed my backyard in one day. My garden had become a bit of a jungle. I uploaded a photo of the mess, and a landscaping team gave me a quote that was 20% cheaper than a local company I called directly. They cleared the waste, trimmed the hedges, and left everything tidy. I'll definitely be using them for monthly maintenance.",
            rating: 5
        },
    ];

    useEffect(() => {
        const testimonialTimer = setInterval(() => {
            setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
        }, 4000);

        return () => {
            clearInterval(testimonialTimer);
        };
    }, [testimonials.length]);

    return (
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-zinc-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-4 xs:mb-5 sm:mb-6 md:mb-8 lg:mb-12">
                    <h2 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 px-2">
                        Join our group of happy customers
                    </h2>
                    <div className="flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 mt-2 xs:mt-2.5 sm:mt-3 md:mt-4">
                        <div className="flex text-[#1149C7]">
                            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />)}
                        </div>
                        <span className="font-bold text-xs xs:text-sm sm:text-base md:text-lg">
                            Thousands of 5 star reviews
                        </span>
                    </div>
                    <p className="text-gray-600 mt-1.5 xs:mt-2 text-xs xs:text-sm sm:text-base">
                        Read real reviews from customers about their service experiences.
                    </p>
                </div>

                {/* Infinite Carousel - Show 3 testimonials */}
                <div className="relative">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                        {[0, 1, 2].map((offset) => {
                            const index = (currentTestimonialIndex + offset) % testimonials.length;
                            const t = testimonials[index];
                            return (
                                <div
                                    key={offset}
                                    className="bg-white p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 rounded-md xs:rounded-lg shadow-sm border border-gray-100 transition-all duration-500"
                                >
                                    <h3 className="font-bold text-sm xs:text-base sm:text-lg mb-1.5 xs:mb-2">
                                        {t.title}
                                    </h3>
                                    <div className="flex text-[#1149C7] mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">
                                        {[1, 2, 3, 4, 5].map(k => (
                                            <StarIcon key={k} className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 italic mb-3 xs:mb-4 sm:mb-5 md:mb-6 text-xs xs:text-sm sm:text-base">
                                        "{t.quote}"
                                    </p>
                                    <div className="flex justify-between items-center mt-auto">
                                        <span className="font-bold text-gray-900 text-xs xs:text-sm sm:text-base">
                                            {t.name}
                                        </span>
                                        <span className="text-[#1149C7] text-[10px] xs:text-xs sm:text-sm font-bold cursor-pointer hover:underline">
                                            Read more
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Carousel indicators */}
                    <div className="flex justify-center gap-2 mt-6">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentTestimonialIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${i === currentTestimonialIndex ? 'bg-[#1149C7] w-8' : 'bg-gray-300'
                                    }`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
