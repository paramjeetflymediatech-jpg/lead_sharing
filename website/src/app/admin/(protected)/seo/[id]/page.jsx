"use client";

import { useState, useEffect, use } from "react";
import SeoForm from "../_components/SeoForm";
import toast from "react-hot-toast";

export default function EditSeoPage({ params }) {
    const { id } = use(params);
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/seo/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setInitialData(data);
                } else {
                    toast.error("Failed to load SEO data");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error fetching SEO data");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!initialData) return <div className="p-8 text-center text-red-500">SEO Configuration not found</div>;

    return <SeoForm initialData={initialData} isEditing={true} />;
}
