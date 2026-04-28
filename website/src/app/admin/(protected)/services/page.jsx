"use client";

import { useEffect, useState } from "react";
import {
    MagnifyingGlassIcon,
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    XMarkIcon,
    WrenchScrewdriverIcon,
    PhotoIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../../../components/Pagination";

export default function ServicesManagement() {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
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
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: [],
        location: "",
        content: "",
        category_id: "",
        image: "",
        is_active: 1
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchServices();
        fetchCategories();
        fetchLocations();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const fetchServices = async () => {
        try {
            const res = await fetch("/api/admin/services");
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching services");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchLocations = async () => {
        try {
            const res = await fetch("/api/admin/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching locations");
        }
    };

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.category?.name || "").toLowerCase().includes(search.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentServices = filtered.slice(indexOfFirstItem, indexOfLastItem);

    const openCreateModal = () => {
        setModalType("create");
        setFormData({ name: "", slug: "", location: "", description: [], content: "", category_id: "", image: "", is_active: 1 });
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setModalType("edit");
        
        let desc = item.description || [];
        if (typeof desc === 'string') {
            try {
                if (desc.startsWith('[') || desc.startsWith('{')) {
                    desc = JSON.parse(desc);
                } else if (desc.trim().length > 0) {
                    desc = [{ tag: 'p', text: desc }];
                } else {
                    desc = [];
                }
            } catch (e) {
                desc = [{ tag: 'p', text: desc }];
            }
        }
        
        if (!Array.isArray(desc)) {
            desc = [];
        }

        setFormData({
            name: item.name,
            slug: item.slug,
            location: item.location || "",
            description: desc,
            content: item.content || "",
            category_id: item.category_id || "",
            image: item.image || "",
            is_active: item.is_active
        });
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({ ...formData, image: data.url });
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const dataToSend = {
            ...formData,
            slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        };

        try {
            if (modalType === "create") {
                const res = await fetch("/api/admin/services", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to create service");

                toast.success("Service created!");
                setServices([data, ...services]);
                closeModal();
            } else {
                const res = await fetch(`/api/admin/services/${selectedItem._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataToSend),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.message || "Failed to update service");

                toast.success("Service updated!");
                setServices(services.map(s => s._id === selectedItem._id ? data : s));
                closeModal();
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this service?")) return;

        try {
            const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Service deleted");
            setServices(services.filter(s => s._id !== id));
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading services...</div>;

    return (
        <div className="space-y-8 p-3 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">Services</h1>
                    <p className="text-zinc-500 mt-2 text-sm md:text-base">Manage the services offered on the platform.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-auto">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search services..."
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
                        Add Service
                    </button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {currentServices.map((service) => (
                            <tr key={service._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                                            {service.image ? (
                                                <img src={service.image} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <WrenchScrewdriverIcon className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-bold text-zinc-900 dark:text-white">{service.name}</div>
                                            <div className="text-xs text-zinc-500 font-mono">{service.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-400">
                                    {service.category?.name || "Uncategorized"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${service.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-3">
                                        <button onClick={() => openEditModal(service)} className="text-blue-600 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(service._id)} className="text-red-600 hover:text-red-400"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">{modalType === 'create' ? 'New Service' : 'Edit Service'}</h2>
                            <button onClick={closeModal}><XMarkIcon className="w-6 h-6 text-zinc-500" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Slug (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Auto-generated if empty"
                                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none"
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none"
                                    value={formData.category_id}
                                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Location (Optional)</label>
                                <select
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="">Select Location</option>
                                    {locations.map(loc => (
                                        <option key={loc._id} value={loc.name}>{loc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description (Blocks)</label>
                                <div className="space-y-3">
                                    {(Array.isArray(formData.description) ? formData.description : []).map((block, index) => (
                                        <div key={index} className="flex items-start gap-2 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                            <select
                                                className="w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none text-sm dark:text-white"
                                                value={block.tag}
                                                onChange={(e) => {
                                                    const newDesc = [...formData.description];
                                                    newDesc[index].tag = e.target.value;
                                                    setFormData({ ...formData, description: newDesc });
                                                }}
                                            >
                                                <option value="p">Paragraph</option>
                                                <option value="h2">Heading 2</option>
                                                <option value="h3">Heading 3</option>
                                                <option value="ul">Bulleted List (UL)</option>
                                                <option value="ol">Numbered List (OL)</option>
                                            </select>
                                            <textarea
                                                rows={2}
                                                className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none text-sm dark:text-white"
                                                placeholder={block.tag === 'ul' || block.tag === 'ol' ? "Enter list items, one per line..." : "Text content..."}
                                                value={block.text}
                                                onChange={(e) => {
                                                    const newDesc = [...formData.description];
                                                    newDesc[index].text = e.target.value;
                                                    setFormData({ ...formData, description: newDesc });
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newDesc = formData.description.filter((_, i) => i !== index);
                                                    setFormData({ ...formData, description: newDesc });
                                                }}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newDesc = Array.isArray(formData.description) ? [...formData.description] : [];
                                            newDesc.push({ tag: 'p', text: '' });
                                            setFormData({ ...formData, description: newDesc });
                                        }}
                                        className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                                    >
                                        <PlusIcon className="w-4 h-4" /> Add Block
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Detailed Content (HTML allowed)</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none font-mono text-sm"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Service Image</label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Image URL"
                                            className="flex-1 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white outline-none"
                                            value={formData.image}
                                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                                        />
                                        <label className="cursor-pointer bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center justify-center min-w-[44px]">
                                            {uploading ? (
                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <PhotoIcon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                                            )}
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    {formData.image && (
                                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, image: "" })}
                                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active === 1}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Active and visible on site</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100">Cancel</button>
                                <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 disabled:opacity-50">
                                    {submitting ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
