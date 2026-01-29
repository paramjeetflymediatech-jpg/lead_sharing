"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDownIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, UserCircleIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";

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

  // User state
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Fetch trades
    fetch('/api/subcategories')
      .then(res => res.json())
      .then(data => setTrades(data.map(t => t.name)))
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

  const adviceItems = [
    "Ask a tradesperson", "Cost guides", "Homeowner advice centre",
    "Inspiration centre", "Trade advice centre", "Trends report"
  ];

  const locations = [
    "Greater London", "South East", "South West", "East of England",
    "West Midlands", "East Midlands", "Yorkshire & the Humber",
    "North West", "North East", "North Wales", "South Wales",
    "West Wales", "Southern Scotland", "Central Scotland",
    "Highlands and Islands (Scotland)", "Northern Ireland"
  ];

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
        <Link href="/" className="text-2xl font-bold tracking-tight text-[#1149C7]">
          Leadsharing
        </Link>


        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-gray-700 h-full cursor-pointer">

          {/* Search Box */}
          <div className="relative w-64 hidden xl:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search trades..."
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-[#1149C7] focus:ring-1 focus:ring-[#1149C7]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              />
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {showSearchDropdown && searchQuery && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                {filteredHeaderTrades.length > 0 ? (
                  filteredHeaderTrades.map((trade) => (
                    <Link
                      key={trade}
                      href={`/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1149C7]"
                      onClick={() => setShowSearchDropdown(false)}
                    >
                      {trade}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No matches found</div>
                )}
              </div>
            )}
          </div>


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
                <div className="max-w-7xl mx-auto p-8">
                  <h3 className="text-[#1149C7] font-bold text-lg mb-4 border-b pb-2">All Trades</h3>
                  <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                    {trades.map((trade) => (
                      <Link
                        key={trade}
                        href={`/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                        className="text-gray-600 hover:text-[#1149C7] text-sm hover:underline block"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {trade}
                      </Link>
                    ))}
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
                <div className="max-w-7xl mx-auto p-8">
                  <h3 className="text-[#1149C7] font-bold text-lg mb-4 border-b pb-2">Advice & Guides</h3>
                  <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    {adviceItems.map((item) => (
                      <Link
                        key={item}
                        href="#"
                        className="text-gray-600 hover:text-[#1149C7] text-sm hover:underline block"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {item}
                      </Link>
                    ))}
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
                <div className="max-w-7xl mx-auto p-8">
                  <h3 className="text-[#1149C7] font-bold text-lg mb-4 border-b pb-2">Browse by Location</h3>
                  <div className="grid grid-cols-4 gap-x-8 gap-y-3">
                    {locations.map((loc) => (
                      <Link
                        key={loc}
                        href="#"
                        className="text-gray-600 hover:text-[#1149C7] text-sm hover:underline block"
                        onClick={() => setActiveDropdown(null)}
                      >
                        {loc}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

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
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1149C7]"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Profile
                  </Link>
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
        <div className="lg:hidden fixed inset-0 top-20 bg-white z-40 overflow-y-auto pb-20">
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
                <div className="pl-4 grid grid-cols-1 gap-2 mt-2 bg-gray-50 p-3 rounded-lg">
                  {trades.map((trade) => (
                    <Link
                      key={trade}
                      href={`/auth/register?role=HOMEOWNER&trade=${trade.toLowerCase().replace(/ /g, '-')}`}
                      className="text-gray-600 text-sm py-1 border-b border-gray-200 last:border-0"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {trade}
                    </Link>
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
                  {adviceItems.map((item) => (
                    <Link key={item} href="#" className="text-gray-600 text-sm py-1" onClick={() => setIsMobileMenuOpen(false)}>
                      {item}
                    </Link>
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
                  {locations.map((loc) => (
                    <Link key={loc} href="#" className="text-gray-600 text-sm py-1" onClick={() => setIsMobileMenuOpen(false)}>
                      {loc}
                    </Link>
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
