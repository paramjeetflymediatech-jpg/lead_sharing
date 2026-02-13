import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/api";

/**
 * API Service Layer
 * Centralized service for all API calls to the backend
 */

// ============================================
// Helper Functions
// ============================================

/**
 * Get auth token from storage
 */
async function getAuthToken() {
    try {
        const token = await AsyncStorage.getItem("token");
        return token;
    } catch (error) {
        console.error("Error getting token:", error);
        return null;
    }
}

/**
 * Generic API call wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
    const token = await getAuthToken();

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token && !options.skipAuth) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

// ============================================
// AUTH APIs
// ============================================

export const authAPI = {
    /**
     * Login user
     */
    login: async (email, password) => {
        return apiCall("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            skipAuth: true,
        });
    },

    /**
     * Register new user
     */
    register: async (userData) => {
        return apiCall("/api/auth/register", {
            method: "POST",
            body: JSON.stringify(userData),
            skipAuth: true,
        });
    },

    /**
     * Logout user
     */
    logout: async () => {
        return apiCall("/api/auth/logout", {
            method: "POST",
        });
    },

    /**
     * Request password reset
     */
    forgotPassword: async (email) => {
        return apiCall("/api/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
            skipAuth: true,
        });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token, password) => {
        return apiCall("/api/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ token, password }),
            skipAuth: true,
        });
    },

    /**
     * Update password (when logged in)
     */
    updatePassword: async (currentPassword, newPassword) => {
        return apiCall("/api/auth/update-password", {
            method: "POST",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
    },
};

// ============================================
// USER/PROFILE APIs
// ============================================

export const userAPI = {
    /**
     * Get current user profile
     */
    getMe: async () => {
        return apiCall("/api/me");
    },

    /**
     * Get user profile
     */
    getProfile: async () => {
        return apiCall("/api/profile");
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData) => {
        return apiCall("/api/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Update current user (User model)
     * Used for Homeowners and basic user details
     */
    updateMe: async (userData) => {
        return apiCall("/api/me", {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },
};

// ============================================
// CATEGORIES APIs
// ============================================

export const categoryAPI = {
    /**
     * Get all categories
     */
    getAll: async () => {
        return apiCall("/api/categories");
    },

    /**
     * Get single category
     */
    getById: async (id) => {
        return apiCall(`/api/categories/${id}`);
    },

    /**
     * Create category (admin)
     */
    create: async (categoryData) => {
        return apiCall("/api/categories", {
            method: "POST",
            body: JSON.stringify(categoryData),
        });
    },
};

// ============================================
// SUBCATEGORIES APIs
// ============================================

export const subcategoryAPI = {
    /**
     * Get all subcategories (optionally filtered by category)
     */
    getAll: async (categoryId = null) => {
        const endpoint = categoryId
            ? `/api/subcategories?categoryId=${categoryId}`
            : "/api/subcategories";
        return apiCall(endpoint);
    },

    /**
     * Get single subcategory
     */
    getById: async (id) => {
        return apiCall(`/api/subcategories/${id}`);
    },

    /**
     * Create subcategory (admin)
     */
    create: async (subcategoryData) => {
        return apiCall("/api/subcategories", {
            method: "POST",
            body: JSON.stringify(subcategoryData),
        });
    },
};

// ============================================
// JOBS APIs
// ============================================

export const jobAPI = {
    /**
     * Get all jobs (available for tradespeople)
     */
    getAll: async (filters = {}) => {
        const queryString = new URLSearchParams(filters).toString();
        const endpoint = queryString ? `/api/jobs?${queryString}` : "/api/jobs";
        return apiCall(endpoint);
    },

    /**
     * Get single job
     */
    getById: async (id) => {
        return apiCall(`/api/jobs/${id}`);
    },

    /**
     * Create new job (homeowner)
     */
    create: async (jobData) => {
        return apiCall("/api/jobs", {
            method: "POST",
            body: JSON.stringify(jobData),
        });
    },

    /**
     * Update job
     */
    update: async (id, jobData) => {
        return apiCall(`/api/jobs/${id}`, {
            method: "PUT",
            body: JSON.stringify(jobData),
        });
    },

    /**
     * Delete job
     */
    delete: async (id) => {
        return apiCall(`/api/jobs/${id}`, {
            method: "DELETE",
        });
    },
};

// ============================================
// HOMEOWNER APIs
// ============================================

export const homeownerAPI = {
    /**
     * Get homeowner dashboard data
     */
    getDashboard: async () => {
        return apiCall("/api/homeowner/dashboard");
    },

    /**
     * Get homeowner's jobs
     */
    getMyJobs: async () => {
        return apiCall("/api/homeowner/my-jobs");
    },

    /**
     * Get single job
     */
    getJob: async (jobId) => {
        return apiCall(`/api/homeowner/my-jobs/${jobId}`);
    },

    /**
     * Get leads for a job
     */
    getJobLeads: async (jobId) => {
        return apiCall(`/api/homeowner/jobs/${jobId}/leads`);
    },

    /**
     * Hire a tradesperson
     */
    hireTradesperson: async (jobId, tradespersonId) => {
        return apiCall(`/api/homeowner/jobs/${jobId}/hire`, {
            method: "POST",
            body: JSON.stringify({ tradespersonId }),
        });
    },

    /**
     * Get messages/conversations
     */
    getMessages: async () => {
        return apiCall("/api/homeowner/messages");
    },

    /**
     * Get conversation messages
     */
    getConversation: async (conversationId) => {
        return apiCall(`/api/homeowner/messages/${conversationId}`);
    },

    /**
     * Send message
     */
    sendMessage: async (conversationId, message) => {
        return apiCall(`/api/homeowner/messages/${conversationId}`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    },
};

// ============================================
// TRADESPERSON APIs
// ============================================

export const tradespersonAPI = {
    /**
     * Get tradesperson profile
     */
    getProfile: async () => {
        return apiCall("/api/tradesperson/profile");
    },

    /**
     * Update tradesperson profile
     */
    updateProfile: async (profileData) => {
        return apiCall("/api/tradesperson/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
    },

    /**
     * Get my leads
     */
    getMyLeads: async () => {
        return apiCall("/api/leads/my");
    },

    /**
     * Get leads for a job
     */
    getJobLeads: async (jobId) => {
        return apiCall(`/api/leads/job/${jobId}`);
    },

    /**
     * Submit a lead (quote) for a job
     */
    submitLead: async (leadData) => {
        return apiCall("/api/leads", {
            method: "POST",
            body: JSON.stringify(leadData),
        });
    },

    /**
     * Unlock a lead (spend credit)
     */
    unlockLeadWithDetail: async ({ jobId, message, priceEstimate }) => {
        return apiCall("/api/leads/unlock", {
            method: "POST",
            body: JSON.stringify({ jobId, message, priceEstimate }),
        });
    },

    /**
     * Search tradespeople
     */
    search: async (filters) => {
        const queryString = new URLSearchParams(filters).toString();
        return apiCall(`/api/tradespeople?${queryString}`);
    },

    /**
     * Top up credits
     */
    topUpCredits: async (plan) => {
        return apiCall("/api/topup", {
            method: "POST",
            body: JSON.stringify({ plan }),
        });
    },

    /**
     * Get all conversations
     */
    getConversations: async () => {
        return apiCall("/api/tradesperson/conversations");
    },

    /**
     * Get conversation messages
     */
    getConversation: async (conversationId) => {
        return apiCall(`/api/tradesperson/messages/${conversationId}`);
    },

    /**
     * Send message to homeowner
     */
    sendMessage: async (conversationId, message) => {
        return apiCall(`/api/tradesperson/messages/${conversationId}`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });
    },
};

// ============================================
// UPLOAD API
// ============================================

export const uploadAPI = {
    /**
     * Upload image/file
     */
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const token = await getAuthToken();

        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Upload failed");
        }

        // Prepend API_BASE_URL if URL is relative
        if (data.url && data.url.startsWith('/')) {
            data.url = `${API_BASE_URL}${data.url}`;
        }

        return data;
    },
};

// ============================================
// ADMIN APIs (for admin users)
// ============================================

export const adminAPI = {
    /**
     * Get dashboard stats
     */
    getDashboard: async () => {
        return apiCall("/api/admin/dashboard");
    },

    /**
     * Get all users
     */
    getUsers: async () => {
        return apiCall("/api/admin/users");
    },

    /**
     * Create user
     */
    createUser: async (userData) => {
        return apiCall("/api/admin/users", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    },

    /**
     * Update user
     */
    updateUser: async (userId, userData) => {
        return apiCall(`/api/admin/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(userData),
        });
    },

    /**
     * Delete user
     */
    deleteUser: async (userId) => {
        return apiCall(`/api/admin/users/${userId}`, {
            method: "DELETE",
        });
    },

    /**
     * Get all jobs
     */
    getJobs: async () => {
        return apiCall("/api/admin/jobs");
    },

    /**
     * Get all leads
     */
    getLeads: async () => {
        return apiCall("/api/admin/leads");
    },

    /**
     * Get/manage categories
     */
    getCategories: async () => {
        return apiCall("/api/admin/categories");
    },

    createCategory: async (categoryData) => {
        return apiCall("/api/admin/categories", {
            method: "POST",
            body: JSON.stringify(categoryData),
        });
    },

    updateCategory: async (categoryId, categoryData) => {
        return apiCall(`/api/admin/categories/${categoryId}`, {
            method: "PATCH",
            body: JSON.stringify(categoryData),
        });
    },

    deleteCategory: async (categoryId) => {
        return apiCall(`/api/admin/categories/${categoryId}`, {
            method: "DELETE",
        });
    },

    /**
     * Get/manage subcategories
     */
    getSubcategories: async () => {
        return apiCall("/api/admin/subcategories");
    },

    createSubcategory: async (subcategoryData) => {
        return apiCall("/api/admin/subcategories", {
            method: "POST",
            body: JSON.stringify(subcategoryData),
        });
    },

    updateSubcategory: async (subcategoryId, subcategoryData) => {
        return apiCall(`/api/admin/subcategories/${subcategoryId}`, {
            method: "PATCH",
            body: JSON.stringify(subcategoryData),
        });
    },

    deleteSubcategory: async (subcategoryId) => {
        return apiCall(`/api/admin/subcategories/${subcategoryId}`, {
            method: "DELETE",
        });
    },
};

// Export all as default
export default {
    auth: authAPI,
    user: userAPI,
    category: categoryAPI,
    subcategory: subcategoryAPI,
    job: jobAPI,
    homeowner: homeownerAPI,
    tradesperson: tradespersonAPI,
    upload: uploadAPI,
    admin: adminAPI,
};
