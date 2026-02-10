"use client";

import { LOCATION_DATA } from "@/constants/locations";

import { useState, useRef, useEffect, useCallback } from "react";
import JobCreationForm from "./jobForm";
import Testimonials from "./Testimonials";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MagnifyingGlassIcon,
    MapPinIcon,
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
            {/* Mobile Responsive: Reduced padding on mobile */}
<section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-[#1149C7] text-white">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-12">

        {/* TEXT — 1st on mobile, LEFT on desktop */}
        <div className="order-1 flex-1 text-center md:text-left">
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2 xs:mb-2.5 sm:mb-3 md:mb-4">
                Track quotes and chat with pros on the go.
            </h2>

            <p className="text-sm xs:text-base sm:text-lg md:text-lg lg:text-xl text-white/90">
                Available on the Apple store and Google play
            </p>
        </div>

        {/* QR CODE — 2nd on mobile, RIGHT on desktop */}
        <div className="order-2 md:order-3 flex-1 flex justify-center">
            <div className="bg-white p-2.5 xs:p-3 sm:p-4 rounded-md xs:rounded-lg">
                <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-[10px] xs:text-xs sm:text-sm">
                    QRCode Placeholder
                </div>
                <p className="text-black text-center mt-1.5 xs:mt-2 font-bold text-[10px] xs:text-xs sm:text-sm">
                    Scan me to download!
                </p>
            </div>
        </div>

        {/* BUTTONS — 3rd on mobile, UNDER TEXT on desktop */}
        <div className="order-3 md:order-2 flex-1 flex justify-center md:justify-start">
            <div className="flex flex-col xs:flex-row gap-2.5 xs:gap-3 sm:gap-4 w-full max-w-[200px]">
                <button className="bg-black text-white px-3.5 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 rounded-md xs:rounded-lg flex items-center justify-center hover:bg-gray-900 transition">
                    <span className="text-[10px] xs:text-xs leading-tight text-left">
                        Download on the<br />
                        <span className="text-sm xs:text-base sm:text-lg font-bold">
                            App Store
                        </span>
                    </span>
                </button>

                <button className="bg-black text-white px-3.5 xs:px-4 sm:px-5 md:px-6 py-2 xs:py-2.5 sm:py-3 rounded-md xs:rounded-lg flex items-center justify-center hover:bg-gray-900 transition">
                    <span className="text-[10px] xs:text-xs leading-tight text-left">
                        GET IT ON<br />
                        <span className="text-sm xs:text-base sm:text-lg font-bold">
                            Google Play
                        </span>
                    </span>
                </button>
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
            <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Mobile Responsive: Fluid heading and margin scaling */}
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-5 md:mb-6 lg:mb-8 border-b border-gray-200 pb-2 xs:pb-2.5 sm:pb-3 md:pb-4">Our Trades and Services</h2>
                    {/* Mobile Responsive: Progressive grid columns for all breakpoints */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-1.5 xs:gap-y-2 gap-x-3 xs:gap-x-4 sm:gap-x-5 md:gap-x-6 lg:gap-x-8">
                        {displayAllTrades.length > 0 ? (
                            displayAllTrades.map((trade, index) => (
                                // Mobile Responsive: Responsive link text
                                <Link
                                    key={index}
                                    href={(user?.role === 'HOMEOWNER' || user?.user?.role === 'HOMEOWNER') ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                                    className="text-[#1149C7] hover:underline text-[11px] xs:text-xs sm:text-sm py-0.5 xs:py-1 block"
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
                </div>
            </section>

        </div>
    );
}