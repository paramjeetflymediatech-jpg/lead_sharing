"use client";

import { useState, useEffect } from "react";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CheckBadgeIcon,
    UserGroupIcon,
    BriefcaseIcon,
    XCircleIcon,
    PlusIcon,
    PencilSquareIcon,
    TrashIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

import Pagination from "../../../../components/Pagination";

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // CRUD State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
    const [formData, setFormData] = useState({
        description: "",
        homeowner: "",
        category: "",
        subCategory: "",
        budgetMin: "",
        budgetMax: "",
        location: { city: "", postcode: "" },
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        jobStage: "PLANNING",
        ownership: "OWN",
        startTime: "FLEXIBLE",
        status: "OPEN"
    });
    const [submitting, setSubmitting] = useState(false);

    // Data for selectors
    const [homeowners, setHomeowners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        fetchJobs();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [usersRes, catRes, subRes] = await Promise.all([
                fetch("/api/admin/users?role=HOMEOWNER&limit=1000"),
                fetch("/api/admin/categories"),
                fetch("/api/admin/subcategories")
            ]);
            if (usersRes.ok) {
                const data = await usersRes.json();
                setHomeowners(data.users || []);
            }
            if (catRes.ok) setCategories(await catRes.json());
            if (subRes.ok) setSubcategories(await subRes.json());
        } catch (error) {
            console.error("Error fetching initial data:", error);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await fetch("/api/admin/jobs");
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset pagination when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter]);

    const filteredJobs = jobs.filter((job) => {
        const matchesSearch =
            (job.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (job.homeowner?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (job.homeowner?.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (job.location?.city?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (job.hiredTradespersonName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || job.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({
            description: "",
            homeowner: "",
            category: "",
            subCategory: "",
            budgetMin: "",
            budgetMax: "",
            location: { city: "", postcode: "" },
            contactName: "",
            contactEmail: "",
            contactPhone: "",
            jobStage: "PLANNING",
            ownership: "OWN",
            startTime: "FLEXIBLE",
            status: "OPEN"
        });
        setIsFormModalOpen(true);
    };

    const openEditModal = (job) => {
        setModalMode("edit");
        setFormData({
            _id: job._id,
            description: job.description || "",
            homeowner: job.homeowner?._id || job.homeowner || "",
            category: job.category?._id || job.category || "",
            subCategory: job.subCategory?._id || job.subCategory || "",
            budgetMin: job.budgetMin || "",
            budgetMax: job.budgetMax || "",
            location: {
                city: job.location?.city || "",
                postcode: job.location?.postcode || ""
            },
            contactName: job.contactName || "",
            contactEmail: job.contactEmail || "",
            contactPhone: job.contactPhone || "",
            jobStage: job.jobStage || "PLANNING",
            ownership: job.ownership || "OWN",
            startTime: job.startTime || "FLEXIBLE",
            status: job.status || "OPEN"
        });
        setIsFormModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const method = modalMode === "create" ? "POST" : "PATCH";
            const url = modalMode === "create" ? "/api/admin/jobs" : `/api/admin/jobs/${formData._id}`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success(`Job ${modalMode === "create" ? "created" : "updated"} successfully`);
                fetchJobs();
                setIsFormModalOpen(false);
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to save job");
            }
        } catch (error) {
            console.error("Error saving job:", error);
            toast.error("An error occurred while saving the job");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (jobId) => {
        if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Job deleted successfully");
                setJobs(jobs.filter(j => j._id !== jobId));
            } else {
                const error = await res.json();
                toast.error(error.message || "Failed to delete job");
            }
        } catch (error) {
            console.error("Error deleting job:", error);
            toast.error("An error occurred while deleting the job");
        }
    };

    // Pagination Slicing
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem);

    const getStatusColor = (status) => {
        switch (status) {
            case "OPEN": return "bg-green-100 text-green-800";
            case "HIRED": return "bg-blue-100 text-blue-800";
            case "COMPLETED": return "bg-gray-100 text-gray-800";
            case "CANCELLED": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    // Modal State
    const [selectedJob, setSelectedJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openJobDetails = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    const closeJobDetails = () => {
        setSelectedJob(null);
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Jobs Management</h1>
                    <p className="text-zinc-500 text-sm">Monitor and manage all job postings</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 font-medium text-zinc-600 dark:text-zinc-400 shadow-sm">
                        <BriefcaseIcon className="w-4 h-4 text-blue-500" />
                        <span>Total Jobs: {jobs.length}</span>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Add Job</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search details, locations, or homeowner..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <FunnelIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                        className="w-full pl-10 pr-8 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer dark:text-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="HIRED">Hired / In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No jobs found matching filters.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Job Info</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Homeowner</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Budget</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {currentJobs.map((job) => (
                                    <tr key={job._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 max-w-xs">
                                            <div className="font-medium text-zinc-900 dark:text-white line-clamp-1" title={job.description}>
                                                {job.description}
                                            </div>
                                            <div className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                                                <ClockIcon className="w-3 h-3" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-700 dark:text-zinc-300">{job.category?.name || "N/A"}</div>
                                            <div className="text-zinc-500 text-xs">{job.subCategory?.name || "N/A"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900 dark:text-white">{job.homeowner?.name || "Unknown"}</div>
                                            <div className="text-zinc-500 text-xs">{job.homeowner?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                                                <MapPinIcon className="w-4 h-4 text-zinc-400" />
                                                {job.location?.city || job.location?.postcode || "N/A"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-zinc-900 dark:text-white font-medium">
                                                <CurrencyDollarIcon className="w-4 h-4 text-zinc-400" />
                                                {job.budgetMin} - {job.budgetMax}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${getStatusColor(job.status)}`}>
                                                {job.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => openJobDetails(job)}
                                                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                                                    title="View Details"
                                                >
                                                    <MagnifyingGlassIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(job)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit Job"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(job._id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete Job"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">Loading jobs...</div>
                ) : filteredJobs.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">No jobs found matching filters.</div>
                ) : (
                    currentJobs.map((job) => (
                        <div key={job._id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* <div className="font-bold text-zinc-900 dark:text-white line-clamp-1">{job.description}</div> */}
                                    <div className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" />
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-transparent ${getStatusColor(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>

                            <div className="text-sm text-zinc-600 dark:text-zinc-400 flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Category:</span>
                                    <span className="font-medium text-right text-zinc-900 dark:text-white">{job.category?.name || "N/A"} / {job.subCategory?.name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Homeowner:</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">{job.homeowner?.name || "Unknown"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Budget:</span>
                                    <div className="flex items-center font-medium gap-1 text-zinc-900 dark:text-white">
                                        <CurrencyDollarIcon className="w-3 h-3 text-zinc-400" />
                                        {job.budgetMin} - {job.budgetMax}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Location:</span>
                                    <div className="flex items-center font-medium gap-1 text-zinc-900 dark:text-white">
                                        <MapPinIcon className="w-3 h-3 text-zinc-400" />
                                        {job.location?.city || job.location?.postcode || "N/A"}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
                                <button
                                    onClick={() => openJobDetails(job)}
                                    className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 font-medium text-sm"
                                >
                                    Details
                                </button>
                                <button
                                    onClick={() => openEditModal(job)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(job._id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalItems={filteredJobs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />

            {/* Job Details Modal */}
            {isModalOpen && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Job Details</h2>
                                <p className="text-sm text-zinc-500">ID: {selectedJob._id}</p>
                            </div>
                            <button onClick={closeJobDetails} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <XCircleIcon className="w-6 h-6 text-zinc-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Section */}
                            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Current Status</p>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-transparent ${getStatusColor(selectedJob.status)}`}>
                                        {selectedJob.status}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-500 mb-1">Posted On</p>
                                    <p className="font-medium text-zinc-900 dark:text-white">
                                        {new Date(selectedJob.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-2">Description</h3>
                                    <p className="text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl">
                                        {selectedJob.description}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Job Specifics</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-zinc-500">Category</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedJob.category?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Sub-Category</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedJob.subCategory?.name || "N/A"}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Budget Range</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">${selectedJob.budgetMin} - ${selectedJob.budgetMax}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500">Start Time</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedJob.startTime?.replace(/_/g, " ") || "Flexible"}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Location & Contact</h3>

                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <MapPinIcon className="w-5 h-5 text-zinc-400 shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedJob.location?.city || "Unknown City"}</p>
                                                <p className="text-xs text-zinc-500">{selectedJob.location?.postcode}</p>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 space-y-2">
                                            <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wide">Owner Contact</p>
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedJob.contactName || selectedJob.homeowner?.name}</p>
                                                <p className="text-xs text-zinc-500">{selectedJob.contactEmail || selectedJob.homeowner?.email}</p>
                                                <p className="text-xs text-zinc-500">{selectedJob.contactPhone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                            <button
                                onClick={closeJobDetails}
                                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Job Form Modal (Create/Edit) */}
            {isFormModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800">
                        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                    {modalMode === "create" ? "Add New Job" : "Edit Job"}
                                </h2>
                                <p className="text-sm text-zinc-500">
                                    {modalMode === "create" ? "Create a platform-wide job posting" : `Editing Job ID: ${formData._id}`}
                                </p>
                            </div>
                            <button onClick={() => setIsFormModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                                <XCircleIcon className="w-6 h-6 text-zinc-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Basic Information</h3>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows={4}
                                        className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Detailed job description..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Homeowner</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.homeowner}
                                            onChange={e => setFormData({ ...formData, homeowner: e.target.value })}
                                        >
                                            <option value="" disabled>Select Homeowner</option>
                                            {homeowners.map(user => (
                                                <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Status</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            <option value="OPEN">Open</option>
                                            <option value="HIRED">Hired / In Progress</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Categorization & Budget */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Category & Budget</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Category</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Sub-Category</label>
                                        <select
                                            required
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.subCategory}
                                            onChange={e => setFormData({ ...formData, subCategory: e.target.value })}
                                        >
                                            <option value="" disabled>Select Sub-Category</option>
                                            {subcategories
                                                .filter(sub => !formData.category || sub.category?._id === formData.category || sub.category === formData.category)
                                                .map(sub => (
                                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Budget Min</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.budgetMin}
                                            onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Budget Max</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.budgetMax}
                                            onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location & Contact */}
                            <div className="space-y-4">
                                <h3 className="text-md font-semibold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-zinc-800 pb-2">Location & Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">City</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.location.city}
                                            onChange={e => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Postcode</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.location.postcode}
                                            onChange={e => setFormData({ ...formData, location: { ...formData.location, postcode: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contact Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.contactName}
                                            onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Contact Email</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={formData.contactEmail}
                                            onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 py-4 border-t border-zinc-200 dark:border-zinc-800 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsFormModalOpen(false)}
                                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {modalMode === "create" ? "Create Job" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
