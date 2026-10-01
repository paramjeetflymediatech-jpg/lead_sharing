"use client";

import { useState, useRef } from "react";
import { PhotoIcon, CloudArrowUpIcon, TrashIcon, LinkIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function ImageUploadField({
    label = "Featured Image",
    value = "",
    onChange,
    placeholder = "https://example.com/image.jpg",
    helperText = "Upload a high-quality banner image (JPG, PNG, WebP up to 5MB) or enter an external URL."
}) {
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(!value || value.startsWith("http"));
    const fileInputRef = useRef(null);

    const handleUpload = async (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file (PNG, JPG, WebP, GIF, SVG)");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image file size must be less than 5MB");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                onChange(data.url);
                toast.success("Image uploaded successfully! 🎉");
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(errData.message || "Failed to upload image");
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleRemove = () => {
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">{label}</label>
                <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-xs text-[#1149C7] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {showUrlInput ? "Hide Direct URL" : "Enter Direct URL"}
                </button>
            </div>
            {helperText && <p className="text-xs text-gray-400">{helperText}</p>}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml, image/avif"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
            />

            {/* If an image is selected / uploaded */}
            {value ? (
                <div className="space-y-3">
                    <div className="relative group rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                        <div className="aspect-video max-h-[300px] w-full flex items-center justify-center bg-zinc-900/5 relative overflow-hidden">
                            <img
                                src={value}
                                alt="Featured preview"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                                }}
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs font-semibold">Uploading new image...</p>
                                </div>
                            )}
                        </div>

                        {/* Top Action Overlay */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="bg-white/90 hover:bg-white text-gray-700 text-xs px-3 py-1.5 rounded-lg font-semibold shadow-md backdrop-blur-xs hover:text-[#1149C7] transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <CloudArrowUpIcon className="w-4 h-4" />
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                disabled={uploading}
                                className="bg-red-500/90 hover:bg-red-600 text-white p-1.5 rounded-lg shadow-md backdrop-blur-xs transition-all cursor-pointer"
                                title="Remove image"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Image Path Bar */}
                        <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2 truncate max-w-[80%]">
                                <PhotoIcon className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate font-mono">{value}</span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                Ready
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                /* Empty state / Dropzone */
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragging
                            ? "border-[#1149C7] bg-blue-50/50 scale-[0.99]"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 bg-gray-50/40"
                    }`}
                >
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1149C7] flex items-center justify-center shadow-inner">
                            {uploading ? (
                                <div className="w-6 h-6 border-2 border-[#1149C7] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <CloudArrowUpIcon className="w-7 h-7" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">
                                {uploading ? "Uploading image..." : "Click or drag & drop to upload featured image"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG, WebP, GIF, SVG up to 5MB
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={uploading}
                            className="mt-1 bg-white hover:bg-gray-50 text-[#1149C7] border border-[#1149C7]/30 px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:border-[#1149C7] transition-all cursor-pointer"
                        >
                            Browse Device
                        </button>
                    </div>
                </div>
            )}

            {/* Direct URL input field (collapsible or toggleable) */}
            {showUrlInput && (
                <div className="mt-2 space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Or Image URL</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={placeholder}
                            className="w-full pl-9 pr-8 py-2.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#1149C7] transition-all"
                        />
                        <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        {value && (
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
