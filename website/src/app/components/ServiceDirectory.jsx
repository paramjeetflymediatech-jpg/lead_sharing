"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRightIcon, MagnifyingGlassIcon, MapIcon } from "@heroicons/react/24/outline";

export default function ServiceDirectory() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const itemsPerPage = 60;
    const directoryRef = useRef(null);
    const [dynamicServices, setDynamicServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    const data = await res.json();
                    setDynamicServices(data);
                }
            } catch (error) {
                console.error("Error fetching dynamic services:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const allServices = [...dynamicServices.map(s => s.name)];
    const filteredServices = allServices.filter(serviceName => 
        serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
    const currentServices = filteredServices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => {
        if (directoryRef.current && currentPage !== 1) {
            directoryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentPage]);

    return (
        <div className="bg-white min-h-screen font-sans text-zinc-900" ref={directoryRef}>
            {/* --- DIRECTORY HERO --- */}
            <section className="bg-slate-900 py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-[#1149C7] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        Service Directory
                    </h1>
                    <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
                        Browse our comprehensive list of local trades and services across Canada. Find the right professional for your next project.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-[#1149C7] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
                        <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="pl-6 text-gray-400">
                                <MagnifyingGlassIcon className="w-6 h-6" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search for a service or location..." 
                                className="w-full px-4 py-5 focus:outline-none text-gray-700 text-lg"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                            <div className="pr-2">
                                <button className="bg-[#1149C7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0d38a0] transition-colors">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- LISTING SECTION --- */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="flex items-center justify-between mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <MapIcon className="w-8 h-8 text-[#1149C7]" />
                            All Trades & Locations
                        </h2>
                        <p className="text-gray-500 mt-1">Discover verified professionals in your area</p>
                    </div>
                    <div className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        Total Results: <span className="text-[#1149C7] font-bold">{filteredServices.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-3">
                    {currentServices.map((trade, index) => (
                        <Link
                            key={index}
                            href={`/local-tradespeople/${trade.toLowerCase().replace(/ /g, '-')}`}
                            className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all"
                        >
                            <span className="text-sm text-gray-600 group-hover:text-[#1149C7] transition-colors truncate font-medium">
                                {trade}
                            </span>
                            <ChevronRightIcon className="w-4 h-4 text-gray-300 group-hover:text-[#1149C7] transition-all transform group-hover:translate-x-1" />
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredServices.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <MagnifyingGlassIcon className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                        <p className="text-gray-500">Try adjusting your search term or browse all services.</p>
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="mt-6 text-[#1149C7] font-bold hover:underline"
                        >
                            Clear search
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-20 flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-10 gap-8">
                        <p className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900 font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredServices.length)}</span> to <span className="text-gray-900 font-bold">{Math.min(currentPage * itemsPerPage, filteredServices.length)}</span> of <span className="text-gray-900 font-bold">{filteredServices.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed border border-gray-100' : 'text-gray-700 hover:bg-white hover:text-[#1149C7] border border-gray-200 hover:border-[#1149C7] hover:shadow-lg active:scale-95'}`}
                            >
                                Previous
                            </button>
                            
                            <div className="hidden sm:flex items-center gap-2">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) pageNum = i + 1;
                                    else if (currentPage <= 3) pageNum = i + 1;
                                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    else pageNum = currentPage - 2 + i;
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-12 h-12 flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === pageNum ? 'bg-[#1149C7] text-white shadow-xl shadow-blue-200 scale-110' : 'text-gray-600 hover:bg-gray-50 hover:text-[#1149C7] border border-transparent hover:border-gray-100'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed border border-gray-100' : 'text-gray-700 hover:bg-white hover:text-[#1149C7] border border-gray-200 hover:border-[#1149C7] hover:shadow-lg active:scale-95'}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
