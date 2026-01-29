"use client";

import { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    ListBulletIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function SubcategoriesManagement() {
    const [subcategories, setSubcategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("create"); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({ name: "", categoryId: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, catRes] = await Promise.all([
                    fetch("/api/admin/subcategories"),
                    fetch("/api/admin/categories")
                ]);

                if (subRes.ok && catRes.ok) {
                    setSubcategories(await subRes.json());
                    setCategories(await catRes.json());
                } else {
                    toast.error("Failed to fetch data");
                }
            } catch (error) {
                toast.error("Error loading data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filtered = subcategories.filter(sc =>
        sc.name.toLowerCase().includes(search.toLowerCase()) ||
        sc.category?.name.toLowerCase().includes(search.toLowerCase())
    );

    // --- Modal Handlers ---

    const openCreateModal = () => {
        setModalType("create");
        setFormData({ name: "", categoryId: categories[0]?._id || "" });
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType("edit");
        setFormData({ name: item.name, categoryId: item.category?._id || "" });
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
                const res = await fetch("/api/admin/subcategories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to create subcategory");

                toast.success("Subcategory created!");
                setSubcategories([data, ...subcategories]);
                closeModal();
            } else {
                const res = await fetch(`/api/admin/subcategories/${selectedItem._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to update subcategory");

                toast.success("Subcategory updated!");
                setSubcategories(subcategories.map(c => c._id === selectedItem._id ? data : c));
                closeModal();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this subcategory?")) return;
        try {
            const res = await fetch(`/api/admin/subcategories/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Subcategory deleted");
            setSubcategories(subcategories.filter(c => c._id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-8 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Subcategories</h1>
                    <p className="text-zinc-500 mt-2">Manage specific trade services.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
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
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Add Subcategory</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Parent Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Slug</th>
                            <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filtered.length > 0 ? (
                            filtered.map((sub) => (
                                <tr key={sub._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                <ListBulletIcon className="w-6 h-6" />
                                            </div>
                                            <div className="ml-4 font-bold text-zinc-900 dark:text-white">{sub.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
                                            {sub.category?.name || "Uncategorized"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 bg-zinc-50/50 font-mono text-xs">{sub.slug}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-3">
                                            <button onClick={() => openEditModal(sub)} className="text-blue-600 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(sub._id)} className="text-red-600 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="px-6 py-12 text-center text-zinc-500">No subcategories found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">{modalType === 'create' ? 'New Subcategory' : 'Edit Subcategory'}</h2>
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
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Parent Category</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
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
