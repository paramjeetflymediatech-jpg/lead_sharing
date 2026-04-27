"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LOCATION_DATA,TRADE_SERVICE_LINKS } from "@/constants/locations";
import { FaAppStore, FaGooglePlay } from 'react-icons/fa';
import JobCreationForm from "./jobForm";
import Testimonials from "./Testimonials";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DocumentCheckIcon, ChevronRightIcon} from "@heroicons/react/24/solid";

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

    // Pagination for All Trades section
    const [currentPage, setCurrentPage] = useState(1);
    
    // Initial location data lookup for SSR support
    const getInitialData = () => {
        if (!location) return null;
        const normalizedLocation = location.toLowerCase();
        if (TRADE_SERVICE_LINKS[location]) return TRADE_SERVICE_LINKS[location];
        
        for (const city of Object.values(TRADE_SERVICE_LINKS)) {
            if (city.location.toLowerCase() === normalizedLocation) return city;
            const serviceMatch = city.services.find(s => 
                (typeof s === 'string' ? s : s.name).toLowerCase() === normalizedLocation
            );
            if (serviceMatch) {
                return typeof serviceMatch === 'string' 
                    ? { location: city.location, services: city.services, seo: city.seo, content: city.content, faq: city.faq }
                    : { ...serviceMatch, location: city.location };
            }
        }
        return null;
    };

    const [selectedLocationData, setSelectedLocationData] = useState(getInitialData());
    const [itemsPerPage, setItemsPerPage] = useState(48);

    useEffect(() => {
        const updateItemsPerPage = () => {
            if (window.innerWidth < 640) {
                setItemsPerPage(20);
            } else {
                setItemsPerPage(48);
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
        if (allTradesRef.current && currentPage !== 1) {
            allTradesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    // Update SEO dynamically when a service is selected
    useEffect(() => {
        if (selectedLocationData?.seo) {
            document.title = selectedLocationData.seo.title;
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute('content', selectedLocationData.seo.description);
            }
            const metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                metaKeywords.setAttribute('content', selectedLocationData.seo.keywords);
            }
        }
    }, [selectedLocationData]);

    useEffect(() => {
        if (location && !selectedLocationData) {
            // Re-sync if props change after mount
            setSelectedLocationData(getInitialData());
        }
    }, [location]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, subCatsRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/subcategories')
                ]);
                const catsData = await catsRes.json();
                const subCatsData = await subCatsRes.json();
                console.log('catsData', catsData)
                console.log('subCatsData', subCatsData)
                setCategories(catsData);
                setSubcategories(subCatsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const imageTimer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => {
            clearInterval(imageTimer);
        };
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
    console.log('displayPopularTrades', displayPopularTrades)

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

    // Flatten TRADE_SERVICE_LINKS to get all services for the grid
    const allLocations = Object.values(TRADE_SERVICE_LINKS).flatMap(loc => 
        loc.services.map(s => ({
            name: typeof s === 'string' ? s : s.name,
            cityName: loc.location,
            data: typeof s === 'string' ? null : s
        }))
    );

    const handleServiceClick = (e, trade) => {
        // Find the specific service data
        if (trade.data) {
            setSelectedLocationData({
                ...trade.data,
                location: trade.cityName
            });
        } else {
            const locationEntry = TRADE_SERVICE_LINKS[trade.cityName];
            if (locationEntry) {
                setSelectedLocationData(locationEntry);
            }
        }
    };

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
            {/* Mobile Responsive: Optimized height and padding for all devices */}
            <section ref={jobFormRef} className="relative w-full min-h-[450px] xs:min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24 px-3 xs:px-4 sm:px-6 lg:px-8 text-center flex flex-col justify-center">

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
                {/* Mobile Responsive: Smaller arrows on mobile, adjusted positioning */}
                {/* <button
                    onClick={prevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all shadow-lg"
                >
                    <ChevronLeftIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </button>
                <button
                    onClick={nextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 text-white p-2 sm:p-3 rounded-full backdrop-blur-sm transition-all shadow-lg"
                >
                    <ChevronRightIcon className="w-5 h-5 sm:w-8 sm:h-8" />
                </button> */}

                {/* Content */}
                {/* Mobile Responsive: Optimized spacing for seamless scaling */}
                <div className="relative mx-auto max-w-4xl space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 z-20 px-2 xs:px-3 sm:px-4 md:px-0">
                    {/* Mobile Responsive: Fluid typography scaling across all breakpoints */}
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
                                <span className="text-[#ffdf00]">speed, ease of use,</span>and efficiency
                            </>
                        )}
                    </h1>
                    {/* Mobile Responsive: Scaled subtitle text for readability */}
                    <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl text-white/95 font-medium drop-shadow-md px-2 xs:px-3 sm:px-0">
                        Find reliable, vetted tradespeople right in your neighborhood.
                    </p>

                    {/* Updated Job Creation Form */}
                    <JobCreationForm />
                </div>
            </section>

            {/* --- POPULAR JOBS --- */}
            {/* Mobile Responsive: Reduced padding on mobile */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
                {/* Mobile Responsive: Proportional margins across devices */}
                <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                    {/* Mobile Responsive: Fluid heading scale */}
                    <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-extrabold text-gray-900 inline-block relative px-2">
                        Our most popular jobs
                        <div className="h-0.5 xs:h-1 w-1/2 xs:w-2/5 sm:w-1/3 bg-green-600 mx-auto mt-1.5 xs:mt-2 rounded"></div>
                    </h2>
                </div>

                {/* Mobile Responsive: Single column on mobile, 2 on tablet, 3 on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                        { name: "Internal painting and decorating", image: "/trades/painter.png", slug: "painter" },
                        { name: "Electrical installation or testing", image: "/trades/electrician.png", slug: "electrician" },
                        { name: "Plumbing repair and maintenance", image: "/trades/plumber.png", slug: "plumber" },
                        { name: "Bathroom, kitchen and WC Plumbing", image: "/trades/plumber.png", slug: "plumber" },
                        { name: "Gas boiler - installation", image: "/trades/heating.png", slug: "heating" },
                        { name: "Plaster skimming", image: "/trades/plasterer.png", slug: "plasterer" }
                    ].map((job, idx) => (
                        // Mobile Responsive: Scaled card dimensions for all screens
                        <button
                            key={idx}
                            onClick={(e) => handlePopularJobClick(e, job.slug)}
                            className="group flex items-center bg-gray-50 hover:bg-white border border-gray-100 hover:border-gray-200 rounded-md xs:rounded-lg p-2.5 xs:p-3 sm:p-3.5 md:p-4 transition-all hover:shadow-lg cursor-pointer min-h-[72px] xs:min-h-[80px] sm:min-h-[88px] md:h-24 w-full text-left"
                        >
                            {/* Mobile Responsive: Proportional image sizing */}
                            <div className="flex-shrink-0 mr-2.5 xs:mr-3 sm:mr-3.5 md:mr-4">
                                <img
                                    src={job.image}
                                    alt={job.name}
                                    className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain group-hover:animate-bounce transition-transform"
                                />
                            </div>
                            <div className="flex-grow min-w-0">
                                {/* Mobile Responsive: Responsive text scaling */}
                                <h3 className="text-[11px] xs:text-xs sm:text-sm md:text-sm font-bold text-gray-800 leading-tight group-hover:text-[#1149C7] transition-colors">
                                    {job.name}
                                </h3>
                            </div>
                            {/* Mobile Responsive: Icon size scaling */}
                            <div className="flex-shrink-0 ml-1.5 xs:ml-2">
                                <ChevronRightIcon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-gray-400 group-hover:text-[#1149C7]" />
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            {/* Mobile Responsive: Reduced padding on mobile */}
            <section className="bg-zinc-50 py-8 sm:py-12 md:py-16 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile Responsive: Fluid margin scaling */}
                    <div className="text-center mb-5 xs:mb-6 sm:mb-8 md:mb-10 lg:mb-12">
                        {/* Mobile Responsive: Optimized heading size */}
                        <h2 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl font-bold text-gray-900 px-2">How our service works</h2>
                    </div>

                    {/* Mobile Responsive: Responsive grid with optimal breakpoints */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
                        {/* Step 1 */}
                        {/* Mobile Responsive: Fluid card height scaling */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/heating.png"
                                alt="Post a job"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            {/* Mobile Responsive: Scaled padding for all devices */}
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 1</span>
                                {/* Mobile Responsive: Responsive heading sizing */}
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Post your job for free</h3>
                                {/* Mobile Responsive: Fluid body text */}
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Describe your project using our simple form. Whether it’s a leaky tap or a full renovation, we’ll capture the details to get you accurate pricing.                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        {/* Mobile Responsive: Fluid card height scaling */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/painter.png"
                                alt="Get quotes"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            {/* Mobile Responsive: Scaled padding for all devices */}
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 2</span>
                                {/* Mobile Responsive: Responsive heading sizing */}
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Get quotes</h3>
                                {/* Mobile Responsive: Fluid body text */}
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Sit back as rated professionals review your job. You’ll receive competitive quotes from available experts ready to help.                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        {/* Mobile Responsive: Fluid card height scaling */}
                        <div className="relative h-[240px] xs:h-[260px] sm:h-[300px] md:h-[350px] lg:h-[400px] rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden group">
                            <img
                                src="/trades/plumber.png"
                                alt="Choose a tradesperson"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-white/80"></div>
                            {/* Mobile Responsive: Scaled padding for all devices */}
                            <div className="relative h-full p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-center text-left">
                                <span className="text-blue-600 font-bold mb-1 xs:mb-1.5 sm:mb-2 text-xs xs:text-sm sm:text-base">Step 3</span>
                                {/* Mobile Responsive: Responsive heading sizing */}
                                <h3 className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl font-bold mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 text-gray-900">Choose a tradesperson</h3>
                                {/* Mobile Responsive: Fluid body text */}
                                <p className="text-gray-700 text-xs xs:text-sm sm:text-base md:text-base lg:text-lg leading-relaxed">
                                    Don't just guess. View full profiles, read verified reviews from neighbors, and browse past work galleries to pick your perfect match.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Responsive: Scaled margin */}
                    <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 lg:mt-12 text-center">
                        {/* Mobile Responsive: Full-width button on small screens */}
                        <button
                            onClick={handlePostJobClick}
                            className="bg-[#1149C7] hover:bg-[#0d38a0] text-white font-bold py-2.5 xs:py-3 sm:py-3.5 md:py-4 px-6 xs:px-8 sm:px-10 md:px-12 rounded-md transition-colors text-sm xs:text-base sm:text-base md:text-lg inline-block shadow-md hover:shadow-lg cursor-pointer  xs:w-auto"
                        >
                            Post a job
                        </button>
                    </div>
                </div>
            </section>

            {/* --- APP DOWNLOAD SECTION --- */}
            <section className="relative overflow-hidden py-14 sm:py-16 md:py-20 px-4 sm:px-6 text-white" style={{ background: 'linear-gradient(135deg, #0d3bbf 0%, #1149C7 50%, #1a5ce8 100%)' }}>

                {/* Decorative background orbs */}
                <div className="absolute top-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
                <div className="absolute bottom-[-80px] right-[-40px] w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />
                <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }} />

                <div className="relative max-w-6xl mx-auto">

                    {/* Main flex: stack on mobile, row on md+ */}
                    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-12 lg:gap-20">

                        {/* ── LEFT: TEXT ── */}
                        <div className="flex-1 text-center md:text-left">

                            {/* Pill badge */}
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

                            {/* Feature chips */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {['Real-time quotes', 'In-app chat', 'Verified pros', 'Free to use'].map((f) => (
                                    <span key={f} className="text-xs bg-white/10 border border-white/20 text-white/90 rounded-full px-3 py-1">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* ── RIGHT: QR CARDS ── */}
                        <div className="flex flex-row gap-4 sm:gap-6 justify-center flex-shrink-0">

                            {/* App Store Card */}
                            <div className="group flex flex-col items-center bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 hover:border-white/40 rounded-3xl p-4 sm:p-5 w-[150px] sm:w-[165px] md:w-[175px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

                                {/* Store label */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    <FaAppStore style={{ fontSize: '22px' }} className="text-white" />
                                    <span className="text-xs font-semibold text-white/90">App Store</span>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white rounded-xl p-2 mb-3 shadow-lg w-full flex justify-center">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://apps.apple.com/us/app/allcarepros/id6761529453"
                                        alt="App Store QR Code"
                                        className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded"
                                    />
                                </div>

                                <p className="text-white/60 text-[9px] mb-3 text-center tracking-wide uppercase">Scan to download</p>

                                {/* Download badge */}
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

                                {/* Store label */}
                                <div className="flex items-center gap-1.5 mb-3">
                                    <FaGooglePlay style={{ fontSize: '20px' }} className="text-white" />
                                    <span className="text-xs font-semibold text-white/90">Google Play</span>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white rounded-xl p-2 mb-3 shadow-lg w-full flex justify-center">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://play.google.com/store/apps/details?id=com.allcarepros.app"
                                        alt="Google Play QR Code"
                                        className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] md:w-[120px] md:h-[120px] rounded"
                                    />
                                </div>

                                <p className="text-white/60 text-[9px] mb-3 text-center tracking-wide uppercase">Scan to download</p>

                                {/* Download badge */}
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
            {/* Mobile Responsive: Reduced padding on mobile */}
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
                {/* Mobile Responsive: Fluid gap scaling */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-12">
                    {/* Mobile Responsive: Scaled icon sizing */}
                    <div className="flex-shrink-0">
                        <DocumentCheckIcon className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 text-[#1149C7]" />
                    </div>
                    <div className="text-center md:text-left">
                        {/* Fluid heading sizing */}
                        <h2 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 text-[#1149C7]">Hire safely with our homeowner checklist</h2>
                        {/* Mobile Responsive: Responsive body text */}
                        <p className="text-xs xs:text-sm sm:text-base md:text-base lg:text-lg text-gray-700 mb-3 xs:mb-4 sm:mb-5 md:mb-6">We believe in transparency. Access our essential checklist to learn how to verify insurance, check references, and manage payments securely.</p>
                        {/* Mobile Responsive: Scaled link text */}
                        <a href="#" className="text-[#1149C7] font-bold hover:underline text-sm xs:text-base sm:text-lg">Read our homeowner checklist ›</a>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <Testimonials />

            {/* --- ALL TRADES --- */}
            {/* Mobile Responsive: Reduced padding on mobile */}
            <section ref={allTradesRef} className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile Responsive: Fluid heading and margin scaling */}
                    <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 border-b border-gray-200 pb-4 mb-8">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                            Local Trades & Services
                        </h2>
                        <Link 
                            href="/local-tradespeople" 
                            className="text-[#1149C7] font-bold hover:underline flex items-center gap-1 text-sm md:text-base group"
                        >
                            View Entire Directory
                            <ChevronRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    {/* Mobile Responsive: Progressive grid columns for all breakpoints */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-1.5 xs:gap-y-2 gap-x-3 xs:gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 min-h-[300px]">
                        {allLocations.length > 0 ? (
                            allLocations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trade, index) => (
                                // Mobile Responsive: Responsive link text
                                <Link
                                    key={index}
                                    href={`/local-tradespeople/${trade.name.toLowerCase().replace(/ /g, '-')}`}
                                    onClick={(e) => handleServiceClick(e, trade)}
                                    className={`hover:underline text-[11px] xs:text-xs sm:text-sm py-0.5 xs:py-1 block truncate transition-colors ${
                                        (selectedLocationData?.name === trade.name) || 
                                        (selectedLocationData?.services?.some(s => (typeof s === 'string' ? s : s.name) === trade.name)) 
                                        ? 'text-[#1149C7] font-bold' 
                                        : 'text-[#1149C7]'
                                    }`}
                                    title={trade.name}
                                >
                                    {trade.name}
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
                                // Mobile Responsive: Responsive link text
                                <Link
                                    key={index}
                                    href={(user?.role === 'HOMEOWNER' || user?.user?.role === 'HOMEOWNER') ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[#1149C7] hover:underline text-[11px] xs:text-xs sm:text-sm py-0.5 xs:py-1 block"
                                >
                                    {trade}
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

            {/* --- DYNAMIC SERVICE INFO (SEO, CONTENT & FAQ) --- */}
            {selectedLocationData && (
                <section id="service-info-section" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        {/* SEO Title & Description */}
                        <div className="mb-10 animate-fadeIn">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                                {selectedLocationData.seo.title.split('|')[0].trim()}
                            </h2>
                            <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed text-base sm:text-lg mb-8">
                                <p className="font-medium text-gray-700">{selectedLocationData.seo.description}</p>
                            </div>
                        </div>

                        {/* Detailed Content Section */}
                        {selectedLocationData.content && (
                            <div className="mb-12 md:mb-16 bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 animate-fadeIn" style={{ animationDelay: '50ms' }}>
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-8 bg-[#1149C7] rounded-full"></span>
                                    About Our Services in {selectedLocationData.location}
                                </h3>
                                <div className="text-gray-600 leading-relaxed text-base sm:text-lg space-y-4">
                                    {selectedLocationData.content.split('\n').map((paragraph, i) => (
                                        <p key={i}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ Section */}
                        {selectedLocationData.faq && selectedLocationData.faq.length > 0 && (
                            <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                                {/* FAQ Schema */}
                                <script
                                    type="application/ld+json"
                                    dangerouslySetInnerHTML={{
                                        __html: JSON.stringify({
                                            "@context": "https://schema.org",
                                            "@type": "FAQPage",
                                            "mainEntity": selectedLocationData.faq.map(item => ({
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
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-[#1149C7]/10 flex items-center justify-center">
                                        <span className="text-2xl text-[#1149C7]">?</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
                                        <p className="text-gray-500 text-sm sm:text-base">Everything you need to know about our services</p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:gap-6">
                                    {selectedLocationData.faq.map((item, idx) => (
                                        <div key={idx} className="group bg-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#1149C7]/20 transition-all duration-300">
                                            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-3 group-hover:text-[#1149C7] transition-colors">
                                                {item.question}
                                            </h4>
                                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                                {item.answer}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            )}

        </div>
    );
}