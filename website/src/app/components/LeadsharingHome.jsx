"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { LOCATION_DATA } from "@/constants/locations";
import { FaAppStore, FaGooglePlay } from 'react-icons/fa';
import JobCreationForm from "./jobForm";
import Testimonials from "./Testimonials";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentCheckIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { cachedFetch } from "@/lib/client-cache";

const FALLBACK_TRADES = [
    "Plumbing",
    "Electrical",
    "Painting & Decorating",
    "Carpentry",
    "Plastering",
    "Heating",
    "Roofing",
    "Gardening",
    "Bathroom Fitting",
    "Kitchen Fitting",
    "Tiling",
    "Locksmith",
    "Handyman",
    "Flooring",
    "Bricklaying",
    "Appliance Repair"
];

const POPULAR_JOBS_STATIC = [
    { name: "Internal painting and decorating", image: "/trades/painter.png", slug: "painter" },
    { name: "Electrical installation or testing", image: "/trades/electrician.png", slug: "electrician" },
    { name: "Plumbing repair and maintenance", image: "/trades/plumber.png", slug: "plumber" },
    { name: "Bathroom, kitchen and WC Plumbing", image: "/trades/plumber.png", slug: "plumber" },
    { name: "Gas boiler - installation", image: "/trades/heating.png", slug: "heating" },
    { name: "Plaster skimming", image: "/trades/plasterer.png", slug: "plasterer" }
];

const INITIAL_TRADES_LIMIT = 32;

export default function LeadsharingHome({ location }) {
    const router = useRouter();
    const [trade, setTrade] = useState("");
    const [description, setDescription] = useState("");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showAllTrades, setShowAllTrades] = useState(false);
    const [tradeSearch, setTradeSearch] = useState("");

    // Pagination for All Trades section
    const [currentPage, setCurrentPage] = useState(1);

    const getInitialData = () => {
        return null;
    };

    const [selectedLocationData, setSelectedLocationData] = useState(getInitialData());
    const [itemsPerPage, setItemsPerPage] = useState(48);

    useEffect(() => {
        const updateItemsPerPage = () => {
            if (typeof window !== "undefined") {
                if (window.innerWidth < 640) {
                    setItemsPerPage(20);
                } else {
                    setItemsPerPage(48);
                }
            }
        };

        updateItemsPerPage();
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    // Ref to job form section
    const jobFormRef = useRef(null);
    const allTradesRef = useRef(null);

    const images = [
        "/trades/painter.png",
        "/trades/electrician.png",
        "/trades/plumber.png",
        "/trades/heating.png",
        "/trades/plasterer.png",
        "/trades/carpenter.png"
    ];

    // Fetch user data in background without blocking initial page render
    const fetchUser = useCallback(async () => {
        try {
            const userData = await cachedFetch("/api/me", {
                credentials: "include",
            }, 60000); // 1 min cache for user session

            if (userData && (userData.user || userData.role || userData.email)) {
                const userObj = userData.user || userData;
                setUser(userObj);

                // 🚫 Redirect tradesperson away from homepage
                const userRole = userObj?.role;
                if (userRole === "TRADESPERSON") {
                    router.push("/tradesperson");
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        }
    }, [router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        if (allTradesRef.current && currentPage !== 1) {
            allTradesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    // Update SEO dynamically when a service is selected
    useEffect(() => {
        if (selectedLocationData?.seo && typeof document !== "undefined") {
            document.title = selectedLocationData.seo.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', selectedLocationData.seo.description);
            }
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', selectedLocationData.seo.keywords || "");
            }
        }
    }, [selectedLocationData]);

    useEffect(() => {
        if (location && !selectedLocationData) {
            setSelectedLocationData(getInitialData());
        }
    }, [location, selectedLocationData]);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [catsData, subCatsData] = await Promise.all([
                    cachedFetch('/api/categories', {}, 600000), // 10 min cache
                    cachedFetch('/api/subcategories', {}, 600000)
                ]);

                if (isMounted) {
                    setCategories(Array.isArray(catsData) ? catsData : []);
                    setSubcategories(Array.isArray(subCatsData) ? subCatsData : []);
                }
            } catch (error) {
                console.error("Error fetching homepage data:", error);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchData();

        const imageTimer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(imageTimer);
        };
    }, []);

    const [dynamicServices, setDynamicServices] = useState([]);

    useEffect(() => {
        let isMounted = true;
        const fetchDynamicServices = async () => {
            try {
                const data = await cachedFetch('/api/services', {}, 600000);
                if (isMounted && Array.isArray(data)) {
                    setDynamicServices(data);
                }
            } catch (error) {
                console.error("Error fetching dynamic services:", error);
            }
        };
        fetchDynamicServices();
        return () => {
            isMounted = false;
        };
    }, []);

    // Map dynamic services to the grid
    const dynamicLocations = useMemo(() => {
        return dynamicServices.map(s => {
            const descText = Array.isArray(s.description)
                ? s.description.map(b => b.text).join(" ")
                : (s.description || s.name);

            return {
                name: s.name,
                cityName: s.location || (s.name.includes(" in ") ? s.name.split(" in ")[1] : "Local Area"),
                data: {
                    location: s.location || (s.name.includes(" in ") ? s.name.split(" in ")[1] : "Local Area"),
                    content: s.content || "",
                    description: s.description,
                    faq: s.faq || [],
                    seo: {
                        title: s.name,
                        description: descText
                    }
                },
                isDynamic: true
            };
        });
    }, [dynamicServices]);

    const allLocations = dynamicLocations;

    const handleServiceClick = (e, tradeItem) => {
        if (tradeItem.data) {
            setSelectedLocationData({
                ...tradeItem.data,
                location: tradeItem.cityName
            });
        }
    };

    // Memoize popular trades to prevent heavy recalculations on slider ticks
    const displayPopularTrades = useMemo(() => {
        if (!subcategories || subcategories.length === 0) {
            return POPULAR_JOBS_STATIC;
        }
        return subcategories.slice(0, 6).map(sub => ({
            name: sub.name,
            sub: sub.category?.name || "General Trade",
            slug: sub.slug || sub.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            image: `/trades/${sub.slug || 'painter'}.png`
        }));
    }, [subcategories]);

    // Memoize all trades list
    const allTrades = useMemo(() => {
        if (!subcategories || subcategories.length === 0) {
            return FALLBACK_TRADES;
        }
        return subcategories.map(sub => sub.name);
    }, [subcategories]);

    const displayAllTrades = allTrades;

    // Optimized visible trades with search and limit to handle large datasets efficiently
    const visibleTrades = useMemo(() => {
        let list = displayAllTrades;
        if (tradeSearch.trim()) {
            const q = tradeSearch.toLowerCase().trim();
            return list.filter(t => t.toLowerCase().includes(q));
        }
        return showAllTrades ? list : list.slice(0, INITIAL_TRADES_LIMIT);
    }, [displayAllTrades, showAllTrades, tradeSearch]);

    // Handle popular job click
    const handlePopularJobClick = (e, slug) => {
        e.preventDefault();
        const userEmail = user?.email;
        const userRole = user?.role;

        if (userEmail && userRole === "HOMEOWNER") {
            router.push("/jobs");
        } else {
            try {
                sessionStorage.setItem("pendingTrade", slug);
            } catch (err) {
                console.error("Failed to store pending trade", err);
            }
            router.push(`/auth/register?role=HOMEOWNER&redirect=/jobs&trade=${slug}`);
        }
    };

    // Handle "Post a job" button click
    const handlePostJobClick = (e) => {
        e.preventDefault();
        const userEmail = user?.email;
        const userRole = user?.role;

        if (userEmail && userRole === "HOMEOWNER") {
            router.push("/jobs");
        } else {
            try {
                sessionStorage.setItem("pendingJobPost", "true");
            } catch (err) {
                console.error("Failed to store pending job flag", err);
            }
            router.push("/auth/register?role=HOMEOWNER&redirect=/jobs");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans text-zinc-900" suppressHydrationWarning>

            {/* --- HERO SECTION (With Background Slider) --- */}
            <section ref={jobFormRef} className="relative w-full min-h-[450px] xs:min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24 px-3 xs:px-4 sm:px-6 lg:px-8 text-center flex flex-col justify-center">

                {/* Background Slider */}
                {images.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <img 
                            src={img} 
                            alt="Hero background" 
                            className="w-full h-full object-cover" 
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                    </div>
                ))}

                {/* Content */}
                <div className="relative mx-auto max-w-4xl space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 z-20 px-2 xs:px-3 sm:px-4 md:px-0">
                    <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-extrabold tracking-tight text-white drop-shadow-lg relative inline-block leading-tight">
                        {location ? (
                            <>
                                Local tradespeople in{" "}
                                <span className="text-[#ffdf00]">
                                    {location}
                                </span>
                            </>
                        ) : (
                            <>
                                A sleek platform that emphasizes <br className="hidden sm:block" />
                                <span className="text-[#ffdf00]">speed, ease of use,</span> and efficiency
                            </>
                        )}
                    </h1>
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-medium drop-shadow-md px-2 xs:px-3 sm:px-0">
                        Find reliable, vetted tradespeople right in your neighborhood.
                    </p>

                    {/* Updated Job Creation Form with initial cached data passed in */}
                    <JobCreationForm initialCategories={categories} initialUser={user} />
                </div>
            </section>

            {/* --- POPULAR JOBS --- */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
                <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                    <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold text-gray-900 inline-block relative px-2">
                        Our most popular jobs
                        <div className="h-0.5 xs:h-1 w-1/2 xs:w-2/5 sm:w-1/3 bg-green-600 mx-auto mt-1.5 xs:mt-2 rounded"></div>
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {POPULAR_JOBS_STATIC.map((job, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => handlePopularJobClick(e, job.slug)}
                            className="group flex items-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-md xs:rounded-lg p-2.5 xs:p-3 sm:p-3.5 md:p-4 transition-all hover:shadow-lg cursor-pointer min-h-[72px] xs:min-h-[80px] sm:min-h-[88px] md:h-24 w-full text-left"
                        >
                            <div className="flex-shrink-0 mr-2.5 xs:mr-3 sm:mr-3.5 md:mr-4">
                                <img
                                    src={job.image}
                                    alt={job.name}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform"
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-sm font-bold text-gray-800 leading-tight group-hover:text-[#1149C7] transition-colors">
                                    {job.name}
                                </h3>
                            </div>
                            <div className="flex-shrink-0 ml-1.5 xs:ml-2">
                                <ChevronRightIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-400 group-hover:text-[#1149C7]" />
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="bg-zinc-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                        <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 px-2">How our service works</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                        {/* Step 1 */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/postjob.png"
                                alt="Post a job"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 1</span>
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Post your job for free</h3>
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Describe your project using our simple form. Whether it’s a leaky tap or a full renovation, we’ll capture the details to get you accurate pricing.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/getquotes.png"
                                alt="Get quotes"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 2</span>
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Get quotes</h3>
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Sit back as rated professionals review your job. You’ll receive competitive quotes from available experts ready to help.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/choosetradesperson.png"
                                alt="Choose a tradesperson"
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 3</span>
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Choose a tradesperson</h3>
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Don't just guess. View full profiles, read verified reviews from neighbors, and browse past work galleries to pick your perfect match.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-12 text-center">
                        <button
                            onClick={handlePostJobClick}
                            className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-2.5 xs:py-3 sm:py-3.5 md:py-4 px-6 xs:px-8 sm:px-10 md:px-12 rounded-md transition-colors text-sm xs:text-base sm:text-base md:text-lg inline-block shadow-md hover:shadow-lg cursor-pointer xs:w-auto"
                        >
                            Post a job
                        </button>
                    </div>
                </div>
            </section>

            {/* --- APP DOWNLOAD SECTION --- */}
            <section className="relative overflow-hidden py-14 sm:py-16 md:py-20 px-4 sm:px-6 text-white" style={{ background: 'linear-gradient(135deg, #0d3bbf 0%, #1149C7 50%, #1a5ce8 100%)' }}>
                <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
                <div className="absolute bottom-[-80px] right-[-40px] w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />

                <div className="relative max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">
                        {/* LEFT: TEXT */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-xs font-semibold tracking-wide uppercase text-white/90">Available Now</span>
                            </div>

                            <h2 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight tracking-tight">
                                Track quotes &amp; chat<br className="hidden sm:block" />
                                <span className="text-yellow-300"> with pros on the go.</span>
                            </h2>

                            <p className="text-white/80 text-sm sm:text-base md:text-lg mb-6 max-w-md mx-auto md:mx-0 leading-relaxed">
                                Download the AllCarePros app and manage your jobs from anywhere. Scan a QR code or tap your store below.
                            </p>

                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {['Real-time quotes', 'In-app chat', 'Verified pros', 'Free to use'].map((f) => (
                                    <span key={f} className="text-xs bg-white/10 border border-white/20 text-white/90 rounded-full px-3 py-1">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: QR CARDS */}
                        <div className="flex flex-row gap-4 sm:gap-6 justify-center flex-shrink-0">
                            {/* App Store Card */}
                            <div className="group flex flex-col items-center bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-3xl p-4 sm:p-5 w-[150px] sm:w-[165px] md:w-[175px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <FaAppStore style={{ fontSize: '22px' }} className="text-white" />
                                    <span className="text-xs font-semibold text-white/90">App Store</span>
                                </div>

                                <div className="bg-white rounded-xl p-2 mb-3 shadow-lg w-full flex justify-center">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://apps.apple.com/us/app/allcarepros/id6761529453"
                                        alt="App Store QR Code"
                                        loading="lazy"
                                        decoding="async"
                                        className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded"
                                    />
                                </div>

                                <p className="text-white/60 text-[9px] mb-3 text-center tracking-wide uppercase">Scan to download</p>

                                <a
                                    href="https://apps.apple.com/us/app/allcarepros/id6761529453"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-xl transition-colors duration-200 w-full justify-center"
                                >
                                    <FaAppStore className="flex-shrink-0" style={{ fontSize: '16px' }} />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[8px] text-gray-400">Download on the</span>
                                        <span className="text-[11px] font-bold">App Store</span>
                                    </div>
                                </a>
                            </div>

                            {/* Google Play Card */}
                            <div className="group flex flex-col items-center bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-3xl p-4 sm:p-5 w-[150px] sm:w-[165px] md:w-[175px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                                <div className="flex items-center gap-1.5 mb-3">
                                    <FaGooglePlay style={{ fontSize: '20px' }} className="text-white" />
                                    <span className="text-xs font-semibold text-white/90">Google Play</span>
                                </div>

                                <div className="bg-white rounded-xl p-2 mb-3 shadow-lg w-full flex justify-center">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://play.google.com/store/apps/details?id=com.allcarepros.app"
                                        alt="Google Play QR Code"
                                        loading="lazy"
                                        decoding="async"
                                        className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded"
                                    />
                                </div>

                                <p className="text-white/60 text-[9px] mb-3 text-center tracking-wide uppercase">Scan to download</p>

                                <a
                                    href="https://play.google.com/store/apps/details?id=com.allcarepros.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-xl transition-colors duration-200 w-full justify-center"
                                >
                                    <FaGooglePlay className="flex-shrink-0" style={{ fontSize: '14px' }} />
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[8px] text-gray-400">Get it on</span>
                                        <span className="text-[11px] font-bold">Google Play</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CHECKLIST SECTION --- */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-12">
                    <div className="flex-shrink-0">
                        <DocumentCheckIcon className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-[#1149C7]" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-[#1149C7]">Hire safely with our homeowner checklist</h2>
                        <p className="text-xs xs:text-sm sm:text-base md:text-base lg:text-lg text-gray-700 mb-3 xs:mb-4 sm:mb-5 md:mb-6">We believe in transparency. Access our essential checklist to learn how to verify insurance, check references, and manage payments securely.</p>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <Testimonials />

            {/* --- ALL TRADES & SERVICES (Optimized with Dynamic Directory and Pagination) --- */}
            <section ref={allTradesRef} className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                                Local Trades & Services
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Browse certified professionals across Canada
                            </p>
                        </div>
                        <Link
                            href="/local-tradespeople"
                            className="text-[#1149C7] font-bold hover:underline flex items-center gap-1 text-sm md:text-base group"
                        >
                            View Entire Directory
                            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Progressive grid */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-1.5 xs:gap-y-2 gap-x-3 xs:gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 min-h-[300px]">
                        {allLocations.length > 0 ? (
                            allLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((tradeItem, index) => (
                                <Link
                                    key={`${tradeItem.name}-${index}`}
                                    href={`/local-tradespeople/${tradeItem.name.toLowerCase().replace(/ /g, '-')}`}
                                    onClick={(e) => handleServiceClick(e, tradeItem)}
                                    className={`hover:underline text-[11px] xs:text-xs sm:text-sm py-0.5 xs:py-1 block truncate transition-colors ${(selectedLocationData?.name === tradeItem.name) ||
                                        (selectedLocationData?.services?.some(s => (typeof s === 'string' ? s : s.name) === tradeItem.name))
                                        ? 'text-[#1149C7] font-bold'
                                        : 'text-[#1149C7]'
                                        }`}
                                    title={tradeItem.name}
                                >
                                    {tradeItem.name}
                                </Link>
                            ))
                        ) : (
                            visibleTrades.map((tradeName, index) => (
                                <Link
                                    key={`${tradeName}-${index}`}
                                    href={(user?.role === 'HOMEOWNER') ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${tradeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                                    className="text-[#1149C7] hover:underline text-[11px] xs:text-xs sm:text-sm py-0.5 xs:py-1 block truncate"
                                >
                                    {tradeName}
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {allLocations.length > itemsPerPage && (
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-8 gap-6">
                            <p className="text-sm text-gray-500 order-2 sm:order-1 font-medium">
                                Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, allLocations.length)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, allLocations.length)}</span> of <span className="text-gray-900 font-bold">{allLocations.length}</span> services
                            </p>
                            <div className="flex items-center gap-2 order-1 sm:order-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed border border-gray-100' : 'text-gray-700 hover:bg-white hover:text-[#1149C7] border border-gray-200 hover:border-[#1149C7] hover:shadow-md active:scale-95'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <div className="hidden sm:flex items-center gap-1.5">
                                    {[...Array(Math.min(5, Math.ceil(allLocations.length / itemsPerPage)))].map((_, i) => {
                                        const totalPages = Math.ceil(allLocations.length / itemsPerPage);
                                        let pageNum;

                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === pageNum ? 'bg-[#1149C7] text-white shadow-lg shadow-blue-200 scale-110' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1149C7] border border-transparent hover:border-gray-200'}`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(allLocations.length / itemsPerPage)))}
                                    disabled={currentPage === Math.ceil(allLocations.length / itemsPerPage)}
                                    className={`flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === Math.ceil(allLocations.length / itemsPerPage) ? 'text-gray-300 cursor-not-allowed border border-gray-100' : 'text-gray-700 hover:bg-white hover:text-[#1149C7] border border-gray-200 hover:border-[#1149C7] hover:shadow-md active:scale-95'}`}
                                >
                                    Next
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}