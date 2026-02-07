"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
import { LOCATION_DATA } from "@/constants/locations";

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'trades', 'advice', 'location', or null
  // Mobile accordion states
  const [mobileExpanded, setMobileExpanded] = useState({ trades: false, advice: false, location: false });

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [trades, setTrades] = useState([]);
  const [groupedTrades, setGroupedTrades] = useState({});
  const [activeTradeCategory, setActiveTradeCategory] = useState(null);

  // User state
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Fetch trades
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => {
        setTrades(data.map(t => t.name));

        // Group trades by category
        const grouped = data.reduce((acc, trade) => {
          const catName = trade.category?.name || "Other";
          if (!acc[catName]) acc[catName] = [];
          acc[catName].push(trade);
          return acc;
        }, {});

        setGroupedTrades(grouped);
        const categories = Object.keys(grouped);
        if (categories.length > 0) {
          setActiveTradeCategory(categories[0]);
        }
      })
      .catch(err => console.error(err));

    // Fetch user
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/profile", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setShowUserMenu(false);
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const filteredHeaderTrades = searchQuery === ""
    ? []
    : trades.filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

  const [groupedAdvice, setGroupedAdvice] = useState({
    "Homeowner Advice": ["Ask a tradesperson", "Cost guides", "Homeowner advice centre", "Inspiration centre"],
    "Trade Advice": ["Trade advice centre", "Trends report"]
  });
  const [activeAdviceCategory, setActiveAdviceCategory] = useState("Homeowner Advice");

  const [activeRegion, setActiveRegion] = useState("Greater London");

  /* const LOCATION_DATA moved to constants */


  const locations = Object.keys(LOCATION_DATA);

  const toggleMobileSection = (section) => {
    setMobileExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "TRADESPERSON") return "/tradesperson";
    return "/homeowner";
  };

  return (
    <header className="w-full bg-white border-b border-zinc-200 sticky top-0 z-50 font-sans">
      <div className="mx-auto max-w-7xl px-6 h-20 flex justify-between items-center bg-white relative z-50">
        {/* Logo */}
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded bg-[#1149C7] flex items-center justify-center text-white font-bold text-lg">
            L
          </div>
          <span className="text-xl font-bold text-[#1a1a1a] tracking-tight group-hover:text-[#1149C7] transition-colors">
            Leadsharing
          </span>
        </a>


        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-700 h-full cursor-pointer">




          {/* Find a Trade Dropdown */}
          <div
            className="relative h-full flex items-center cursor-pointer"
            onClick={() => setActiveDropdown(activeDropdown === 'trades' ? null : 'trades')}
          >
            <button className={`flex items-center gap-1 py-2 ${activeDropdown === 'trades' ? 'text-[#1149C7]' : 'hover:text-[#1149C7]'}`}>
              Find a Trade
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'trades' ? 'rotate-180' : ''}`} />
            </button>

            {/* Mega Menu */}
            {activeDropdown === 'trades' && (
              <div
                className="fixed left-0 top-20 w-full bg-white border-t border-gray-100 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-7xl mx-auto flex min-h-[600px] max-h-[80vh]">
                  {/* Left Column: Categories */}
                  <div className="w-1/3 border-r border-gray-100 overflow-y-auto py-6 scrollbar-hide">
                    {Object.keys(groupedTrades).map((category) => (
                      <div
                        key={category}
                        className={`px-8 py-2 cursor-pointer text-sm font-medium transition-colors flex justify-between items-center ${activeTradeCategory === category
                          ? "text-[#1149C7]"
                          : "text-gray-600 hover:text-[#1149C7]"
                          }`}
                        onClick={() => setActiveTradeCategory(category)}
                      >
                        {category}
                        {activeTradeCategory === category && <span className="text-[#1149C7]">›</span>}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Subcategories for Selected Category */}
                  <div className="w-2/3 bg-white p-8 overflow-y-auto scrollbar-hide">
                    <h3 className="text-[#1149C7] font-bold text-xl mb-6 border-b border-gray-100 pb-4">
                      {activeTradeCategory}
                    </h3>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                      {activeTradeCategory && groupedTrades[activeTradeCategory] && groupedTrades[activeTradeCategory].map((trade) => (
                        <Link
                          key={trade._id}
                          href={user?.role === 'HOMEOWNER' ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.name.toLowerCase().replace(/ /g, '-')}`}
                          className="text-gray-600 hover:text-[#1149C7] text-sm font-medium transition-colors hover:underline"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {trade.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advice Centre Dropdown */}
          <div
            className="relative h-full flex items-center cursor-pointer"
            onClick={() => setActiveDropdown(activeDropdown === 'advice' ? null : 'advice')}
          >
            <button className={`flex items-center gap-1 py-2 ${activeDropdown === 'advice' ? 'text-[#1149C7]' : 'hover:text-[#1149C7]'}`}>
              Advice centre
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'advice' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'advice' && (
              <div
                className="fixed left-0 top-20 w-full bg-white border-t border-gray-100 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="max-w-7xl mx-auto flex min-h-[600px] max-h-[80vh]">
                  {/* Left Column: Categories */}
                  <div className="w-1/3 border-r border-gray-100 overflow-y-auto py-6 scrollbar-hide">
                    {Object.keys(groupedAdvice).map((category) => (
                      <div
                        key={category}
                        className={`px-8 py-2 cursor-pointer text-sm font-medium transition-colors flex justify-between items-center ${activeAdviceCategory === category
                          ? "text-[#1149C7]"
                          : "text-gray-600 hover:text-[#1149C7]"
                          }`}
                        onClick={() => setActiveAdviceCategory(category)}
                      >
                        {category}
                        {activeAdviceCategory === category && <span className="text-[#1149C7]">›</span>}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Items for Selected Category */}
                  <div className="w-2/3 bg-white p-8 overflow-y-auto scrollbar-hide">
                    <h3 className="text-[#1149C7] font-bold text-xl mb-6 border-b border-gray-100 pb-4">
                      {activeAdviceCategory}
                    </h3>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                      {activeAdviceCategory && groupedAdvice[activeAdviceCategory] && groupedAdvice[activeAdviceCategory].map((item) => (
                        <Link
                          key={item}
                          href="#"
                          className="text-gray-600 hover:text-[#1149C7] text-sm font-medium transition-colors hover:underline"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {item}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location Dropdown */}
          <div
            className="relative h-full flex items-center cursor-pointer"
            onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
          >
            <button className={`flex items-center gap-1 py-2 ${activeDropdown === 'location' ? 'text-[#1149C7]' : 'hover:text-[#1149C7]'}`}>
              Location
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeDropdown === 'location' ? 'rotate-180' : ''}`} />
            </button>

            {activeDropdown === 'location' && (
              <div
                className="fixed left-0 top-20 w-full bg-white border-t border-gray-100 shadow-xl z-40 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default"
                onClick={(e) => e.stopPropagation()}
              >
                <style jsx global>{`
                  .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                  }
                  .scrollbar-hide {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                  }
                `}</style>
                <div className="max-w-7xl mx-auto flex min-h-[600px] max-h-[80vh]">
                  {/* Left Column: Regions */}
                  <div className="w-1/3 border-r border-gray-100 overflow-y-auto py-6 scrollbar-hide">
                    {locations.map((region) => (
                      <div
                        key={region}
                        className={`px-8 py-2 cursor-pointer text-sm font-medium transition-colors flex justify-between items-center ${activeRegion === region
                          ? "text-[#1149C7]"
                          : "text-gray-600 hover:text-[#1149C7]"
                          }`}
                        onClick={() => setActiveRegion(region)}
                      >
                        {region}
                        {activeRegion === region && <span className="text-[#1149C7]">›</span>}
                      </div>
                    ))}
                  </div>

                  {/* Right Column: Areas for Selected Region */}
                  <div className="w-2/3 bg-white p-8 overflow-y-auto scrollbar-hide">
                    <h3 className="text-[#1149C7] font-bold text-xl mb-6 border-b border-gray-100 pb-4">
                      {activeRegion}
                    </h3>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                      {activeRegion && LOCATION_DATA[activeRegion] && LOCATION_DATA[activeRegion].map((area) => (
                        <Link
                          key={area}
                          href={`/local-tradespeople/${area.toLowerCase().replace(/ /g, '-')}`}
                          className="text-gray-600 hover:text-[#1149C7] text-sm font-medium transition-colors hover:underline"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {area}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/blog" className="hover:text-[#1149C7] py-2">
            Blog
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#1149C7] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1149C7]">
                  <UserCircleIcon className="w-6 h-6" />
                </div>
                <span>{user.name}</span>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-50 mb-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Signed in as</p>
                    <p className="font-bold text-gray-900 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={getDashboardLink()}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1149C7]"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Dashboard
                  </Link>

                  {/* <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1149C7]"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Profile
                  </Link> */}

                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-medium hover:text-[#1149C7]">Log in</Link>
              <Link
                href="/auth/register?role=TRADESPERSON"
                className="rounded-md bg-[#1149C7] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0d38a0]"
              >
                Trade sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-700 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <XMarkIcon className="w-8 h-8" /> : <Bars3Icon className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-[999] overflow-y-auto pb-20 border-t border-gray-100 shadow-xl">
          <div className="flex flex-col p-4 space-y-2">

            {/* Mobile User Section */}
            {user && (
              <div className="border-b border-gray-100 pb-4 mb-2">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-[#1149C7]">
                    <UserCircleIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Link
                  href={getDashboardLink()}
                  className="block w-full text-left px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Sign out
                </button>
              </div>
            )}

            {/* Mobile Trade Section */}
            <div className="border-b border-gray-100 pb-2">
              <button
                onClick={() => toggleMobileSection('trades')}
                className="flex w-full justify-between items-center py-2 font-bold text-gray-800"
              >
                Find a Trade
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${mobileExpanded.trades ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded.trades && (
                <div className="pl-4 flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg">
                  {Object.keys(groupedTrades).map((category) => (
                    <div key={category} className="border-b border-gray-200 last:border-0 pb-2">
                      <button
                        className="flex w-full justify-between items-center py-2 text-sm font-bold text-gray-700 hover:text-[#1149C7]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTradeCategory(activeTradeCategory === category ? null : category);
                        }}
                      >
                        {category}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeTradeCategory === category ? 'rotate-180' : ''}`} />
                      </button>

                      {activeTradeCategory === category && (
                        <div className="pl-4 mt-2 grid grid-cols-1 gap-1">
                          {groupedTrades[category] && groupedTrades[category].map((trade) => (
                            <Link
                              key={trade._id}
                              href={user?.role === 'HOMEOWNER' ? "/jobs" : `/auth/register?role=HOMEOWNER&trade=${trade.name.toLowerCase().replace(/ /g, '-')}`}
                              className="text-gray-600 text-sm py-1 hover:text-[#1149C7] block"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {trade.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Advice Section */}
            <div className="border-b border-gray-100 pb-2">
              <button
                onClick={() => toggleMobileSection('advice')}
                className="flex w-full justify-between items-center py-2 font-bold text-gray-800"
              >
                Advice centre
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${mobileExpanded.advice ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded.advice && (
                <div className="pl-4 flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg">
                  {Object.keys(groupedAdvice).map((category) => (
                    <div key={category} className="border-b border-gray-200 last:border-0 pb-2">
                      <button
                        className="flex w-full justify-between items-center py-2 text-sm font-bold text-gray-700 hover:text-[#1149C7]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveAdviceCategory(activeAdviceCategory === category ? null : category);
                        }}
                      >
                        {category}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeAdviceCategory === category ? 'rotate-180' : ''}`} />
                      </button>

                      {activeAdviceCategory === category && (
                        <div className="pl-4 mt-2 grid grid-cols-1 gap-1">
                          {groupedAdvice[category] && groupedAdvice[category].map((item) => (
                            <Link key={item} href="#" className="text-gray-600 text-sm py-1 hover:text-[#1149C7] block" onClick={() => setIsMobileMenuOpen(false)}>
                              {item}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Location Section */}
            <div className="border-b border-gray-100 pb-2">
              <button
                onClick={() => toggleMobileSection('location')}
                className="flex w-full justify-between items-center py-2 font-bold text-gray-800"
              >
                Location
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${mobileExpanded.location ? 'rotate-180' : ''}`} />
              </button>
              {mobileExpanded.location && (
                <div className="pl-4 flex flex-col gap-2 mt-2 bg-gray-50 p-3 rounded-lg">
                  {locations.map((region) => (
                    <div key={region} className="border-b border-gray-200 last:border-0 pb-2">
                      <button
                        className="flex w-full justify-between items-center py-2 text-sm font-bold text-gray-700 hover:text-[#1149C7]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveRegion(activeRegion === region ? null : region);
                        }}
                      >
                        {region}
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${activeRegion === region ? 'rotate-180' : ''}`} />
                      </button>

                      {activeRegion === region && (
                        <div className="pl-4 mt-2 grid grid-cols-1 gap-1">
                          {LOCATION_DATA[region] && LOCATION_DATA[region].map((area) => (
                            <Link
                              key={area}
                              href={`/local-tradespeople/${area.toLowerCase().replace(/ /g, '-')}`}
                              className="text-gray-600 text-sm py-1 hover:text-[#1149C7] block"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {area}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!user && (
              <div className="pt-4 space-y-3">
                <Link href="/auth/login" className="block text-center w-full border-2 border-gray-200 text-gray-800 rounded-lg py-3 font-bold hover:bg-gray-50">Log in</Link>
                <Link href="/auth/register?role=TRADESPERSON" className="block text-center w-full bg-[#1149C7] text-white rounded-lg py-3 font-bold hover:bg-[#0d38a0]">Trade sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
























