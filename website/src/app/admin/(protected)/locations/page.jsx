"use client";

import { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    MapPinIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../../../components/Pagination";

export default function LocationsManagement() {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("create"); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({ name: "", slug: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    // Reset pagination on search
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchLocations = async () => {
        try {
            const res = await fetch("/api/admin/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            } else {
                toast.error("Failed to fetch locations");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching locations");
        } finally {
            setLoading(false);
        }
    };

    const filtered = locations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLocations = filtered.slice(indexOfFirstItem, indexOfLastItem);

    const openCreateModal = () => {
        setModalType("create");
        setFormData({ name: "", slug: "" });
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType("edit");
        setFormData({ name: item.name, slug: item.slug });
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    // --- API Operations ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (modalType === "create") {
                const res = await fetch("/api/admin/locations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to create location");

                toast.success("Location created!");
                setLocations([data, ...locations]);
                closeModal();
            } else {
                const res = await fetch(`/api/admin/locations/${selectedItem._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to update location");

                toast.success("Location updated!");
                setLocations(locations.map(c => c._id === selectedItem._id ? data : c));
                closeModal();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this location? This action cannot be undone.")) return;

        try {
            const res = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete");
            }
            toast.success("Location deleted");
            setLocations(locations.filter(c => c._id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-8 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Locations</h1>
                    <p className="text-zinc-500 mt-2 text-sm md:text-base">Manage service locations.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-auto">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
                        />
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-900/20 w-full sm:w-auto"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="">Add Location</span>
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Created</th>
                            <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {currentLocations.length > 0 ? (
                            currentLocations.map((loc) => (
                                <tr key={loc._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <MapPinIcon className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 font-bold text-zinc-900 dark:text-white">{loc.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 bg-zinc-50/50 font-mono text-xs">{loc.slug}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">{new Date(loc.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => openEditModal(loc)} className="text-blue-600 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(loc._id)} className="text-red-600 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-zinc-500">No locations found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {currentLocations.length > 0 ? (
                    currentLocations.map((loc) => (
                        <div key={loc._id} className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <MapPinIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-zinc-900 dark:text-white">{loc.name}</h3>
                                        <p className="text-xs text-zinc-500 font-mono">{loc.slug}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <span className="text-xs text-zinc-500">Created: {new Date(loc.createdAt).toLocaleDateString()}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(loc)} className="text-blue-600 hover:text-blue-400 p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20"><PencilSquareIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDelete(loc._id)} className="text-red-600 hover:text-red-400 p-1.5 rounded-md bg-red-50 dark:bg-red-900/20"><TrashIcon className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 text-center text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                        No locations found.
                    </div>
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">{modalType === 'create' ? 'New Location' : 'Edit Location'}</h2>
                            <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-zinc-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug (optional)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.slug}
                                    onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="Leave empty to auto-generate"
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100">Cancel</button>
                                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
