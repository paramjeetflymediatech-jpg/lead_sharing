"use client";

import { LOCATION_DATA } from "@/constants/locations";

import { useState, useRef, useEffect, useCallback } from "react";
import JobCreationForm from "./jobForm";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MagnifyingGlassIcon,
    MapPinIcon,
    StarIcon,
    ShieldCheckIcon,
    CheckCircleIcon,
    DevicePhoneMobileIcon,
    DocumentCheckIcon,
    UserGroupIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    CheckBadgeIcon,
} from "@heroicons/react/24/solid";

export default function LeadsharingHome({ location }) {
    const router = useRouter();
    const [trade, setTrade] = useState("");
    const [description, setDescription] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Ref to job form section
    const jobFormRef = useRef(null);

    const images = [
        "/trades/painter.png",
        "/trades/electrician.png",
        "/trades/plumber.png",
        "/trades/heating.png",
        "/trades/plasterer.png",
        "/trades/carpenter.png"
    ];

    // Fetch user data
    const fetchUser = useCallback(async () => {
        try {
            setIsLoadingUser(true);
            const res = await fetch("/api/me", {
                credentials: "include",
                cache: "no-store",
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);

                // 🚫 Redirect tradesperson away from homepage
                const userRole = userData?.role || userData?.user?.role;
                if (userRole === "TRADESPERSON") {
                    console.log("Tradesperson detected, redirecting to /tradesperson");
                    router.push("/tradesperson");
                    return;
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        } finally {
            setIsLoadingUser(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, subCatsRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/subcategories')
                ]);
                const catsData = await catsRes.json();
                const subCatsData = await subCatsRes.json();
                setCategories(catsData);
                setSubcategories(subCatsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const popularTrades = subcategories.slice(0, 6).map(sub => ({
        name: sub.name,
        sub: sub.category?.name || "General Trade",
        slug: sub.slug,
        image: `/trades/${sub.slug}.png`
    }));

    const displayPopularTrades = popularTrades;

    const testimonials = [
        { name: "Hannat", title: "Well Proven", quote: "Reliable and efficient website and team in helping to find and connect with workmen and people who do various jobs and to a high standard :)" },
        { name: "Helen", title: "Best Site", quote: "This is probably the best site to get experts for your job. I've hired some really good trades people on here. I highly recommend Leadsharing." },
        { name: "Jean", title: "Would highly recommend", quote: "It was so easy, leave an explanation of what you would like done and wait on the responses." },
    ];

    const allTrades = subcategories.map(sub => sub.name);
    const displayAllTrades = allTrades;

    const [showTradeDropdown, setShowTradeDropdown] = useState(false);
    const [showJobDropdown, setShowJobDropdown] = useState(false);

    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationDropdownRef = useRef(null);

    // Close location dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target)) {
                setShowLocationDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const jobTypes = allTrades;

    const filteredTrades = trade === ""
        ? displayAllTrades
        : displayAllTrades.filter((t) => t.toLowerCase().includes(trade.toLowerCase()));

    const filteredJobs = description === ""
        ? jobTypes
        : jobTypes.filter((j) => j.toLowerCase().includes(description.toLowerCase()));

    // Function to scroll to job form
    const scrollToJobForm = () => {
        if (jobFormRef.current) {
            jobFormRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // Handle popular job click
    const handlePopularJobClick = (e, slug) => {
        e.preventDefault();

        // Check if user is logged in and is a homeowner
        const userEmail = user?.email || user?.user?.email;
        const userRole = user?.role || user?.user?.role;

        if (!isLoadingUser && userEmail && userRole === "HOMEOWNER") {
            // If logged in as homeowner, redirect to /jobs
            router.push("/jobs");
        } else {
            // If not logged in or not homeowner, redirect to register
            router.push(`/auth/register?role=HOMEOWNER&trade=${slug}`);
        }
    };

    // Handle "Post a job" button click
    const handlePostJobClick = (e) => {
        e.preventDefault();

        // Check if user is logged in and is a homeowner
        const userEmail = user?.email || user?.user?.email;
        const userRole = user?.role || user?.user?.role;

        if (!isLoadingUser && userEmail && userRole === "HOMEOWNER") {
            // If logged in as homeowner, redirect to /jobs
            router.push("/jobs");
        } else {
            // If not logged in or not homeowner, redirect to register
            router.push("/auth/register?role=HOMEOWNER");
        }
    };

    // Flatten LOCATION_DATA to get all areas for search/dropdown
    const allLocations = Object.values(LOCATION_DATA).flat();

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900" suppressHydrationWarning>

            {/* Show loading spinner while checking user role */}
            {isLoadingUser && (
                <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1149C7]"></div>
                        <p className="text-gray-600 font-medium">Loading...</p>
                    </div>
                </div>
            )}

            {/* --- HERO SECTION (With Background Slider) --- */}
            <section ref={jobFormRef} className="relative w-full min-h-[600px] py-16 px-6 sm:py-24 lg:px-8 text-center flex flex-col justify-center">

                {/* Background Slider */}
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <img src={img} alt="Hero background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all shadow-lg hidden md:block"
                >
                    <ChevronLeftIcon className="w-8 h-8" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all shadow-lg hidden md:block"
                >
                    <ChevronRightIcon className="w-8 h-8" />
                </button>

                {/* Content */}
                <div className="relative mx-auto max-w-4xl space-y-8 z-20">
                    <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg relative inline-block">
                        {location ? (
                            <>
                                Local tradespeople in{" "}
                                <span className="text-[#ffdf00]">
                                    {location}
                                </span>
                            </>
                        ) : (
                            <>
                                Find local and reliable <br className="hidden sm:block" />
                                <span className="text-[#ffdf00]">tradespeople</span> in your area
                            </>
                        )}
                    </h1>
                    <p className="text-lg text-white/95 font-medium drop-shadow-md">
                        Post your job for free. Get quotes. Read reviews.
                    </p>

                    {/* Updated Job Creation Form */}
                    <JobCreationForm />
                </div>
            </section>

            {/* --- POPULAR JOBS --- */}
            <section className="py-16 px-6 max-w-7xl mx-auto w-full">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold text-gray-900 inline-block relative">
                        Our most popular jobs
                        <div className="h-1 w-1/2 bg-green-600 mx-auto mt-2 rounded"></div>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        { name: "Internal painting and decorating", image: "/trades/painter.png", slug: "painter" },
                        { name: "Electrical installation or testing", image: "/trades/electrician.png", slug: "electrician" },
                        { name: "Plumbing repair and maintenance", image: "/trades/plumber.png", slug: "plumber" },
                        { name: "Bathroom, kitchen and WC Plumbing", image: "/trades/plumber.png", slug: "plumber" },
                        { name: "Gas boiler - installation", image: "/trades/heating.png", slug: "heating" },
                        { name: "Plaster skimming", image: "/trades/plasterer.png", slug: "plasterer" }
                    ].map((job, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => handlePopularJobClick(e, job.slug)}
                            className="group flex items-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-lg p-4 transition-all hover:shadow-lg cursor-pointer h-24 w-full text-left"
                        >
                            <div className="flex-shrink-0 mr-4">
                                <img
                                    src={job.image}
                                    alt={job.name}
                                    className="w-12 h-12 object-contain group-hover:animate-bounce transition-transform"
                                />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-[#1149C7] transition-colors">
                                    {job.name}
                                </h3>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-[#1149C7]" />
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="bg-zinc-50 py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">How our service works</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative h-[400px] rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/heating.png"
                                alt="Post a job"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-2">Step 1</span>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Post your job for free</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Our simple form will help you to provide the right detail for accurate, relevant quotes
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative h-[400px] rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/painter.png"
                                alt="Get quotes"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-2">Step 2</span>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Get quotes</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    We'll match you with rated tradespeople who'll get in touch to discuss your needs
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative h-[400px] rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/plumber.png"
                                alt="Choose a tradesperson"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-2">Step 3</span>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">Choose a tradesperson</h3>
                                <p className="text-gray-700 text-lg leading-relaxed">
                                    Check out their profile, reviews and gallery to pick the right person for the job
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 text-center">
                        <button
                            onClick={handlePostJobClick}
                            className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-4 px-12 rounded-md transition-colors text-lg inline-block shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Post a job
                        </button>
                    </div>
                </div>
            </section>

            {/* --- APP DOWNLOAD SECTION --- */}
            <section className="py-16 px-6 bg-[#1149C7] text-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-3xl font-bold mb-4">Get our app for homeowners</h2>
                        <p className="text-xl mb-8 text-white/90">Available on the Apple store and Google play</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition">
                                <span className="text-xs text-left leading-tight">Download on the<br /><span className="text-lg font-bold">App Store</span></span>
                            </button>
                            <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-900 transition">
                                <span className="text-xs text-left leading-tight">GET IT ON<br /><span className="text-lg font-bold">Google Play</span></span>
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="bg-white p-4 rounded-lg">
                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                                QRCode Placeholder
                            </div>
                            <p className="text-black text-center mt-2 font-bold text-sm">Scan me to download!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CHECKLIST SECTION --- */}
            <section className="py-16 px-6 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-shrink-0">
                        <DocumentCheckIcon className="w-32 h-32 text-[#1149C7]" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-4 text-[#1149C7]">Hire safely with our homeowner checklist</h2>
                        <p className="text-lg text-gray-700 mb-6">Our essential tips for hiring a tradesperson. Never pay too much up front, and find out how to check references, qualifications and insurance.</p>
                        <a href="#" className="text-[#1149C7] font-bold hover:underline text-lg">Read our homeowner checklist ›</a>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-16 px-6 bg-zinc-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Join our group of happy customers</h2>
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <div className="flex text-[#1149C7]">
                                {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} className="w-6 h-6" />)}
                            </div>
                            <span className="font-bold text-lg">Thousands of 5 star reviews</span>
                        </div>
                        <p className="text-gray-600 mt-2">Read real reviews from customers about their service experiences.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="font-bold text-lg mb-2">{t.title}</h3>
                                <div className="flex text-[#1149C7] mb-4">
                                    {[1, 2, 3, 4, 5].map(k => <StarIcon key={k} className="w-4 h-4" />)}
                                </div>
                                <p className="text-gray-600 italic mb-6">"{t.quote}"</p>
                                <div className="flex justify-between items-center mt-auto">
                                    <span className="font-bold text-gray-900">{t.name}</span>
                                    <span className="text-[#1149C7] text-sm font-bold cursor-pointer hover:underline">Read more</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- ALL TRADES --- */}
            <section className="py-16 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b border-gray-200 pb-4">Our Trades and Services</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-8">
                        {displayAllTrades.length > 0 ? (
                            displayAllTrades.map((trade, index) => (
                                <Link
                                    key={index}
                                    href={(user?.role === 'HOMEOWNER' || user?.user?.role === 'HOMEOWNER') ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[#1149C7] hover:underline text-sm py-1"
                                >
                                    {trade}
                                </Link>
                            ))
                        ) : (
                            [
                                "Plumbing",
                                "Electrical",
                                "Painting & Decorating",
                                "Carpentry",
                                "Plastering",
                                "Heating",
                                "Roofing",
                                "Gardening"
                            ].map((trade, index) => (
                                <Link
                                    key={index}
                                    href={(user?.role === 'HOMEOWNER' || user?.user?.role === 'HOMEOWNER') ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[#1149C7] hover:underline text-sm py-1"
                                >
                                    {trade}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
}