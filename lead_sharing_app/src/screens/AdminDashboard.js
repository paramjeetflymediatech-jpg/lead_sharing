import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Alert,
    FlatList,
    TextInput,
    Modal,
    ScrollView,
    Linking,
    Image,
} from "react-native";
import { API_BASE_URL } from "../config/api";
import { Picker } from "@react-native-picker/picker";
import AdminLayout from "../components/admin/AdminLayout";
import { adminAPI } from "../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../utils/responsive";

import SettingsScreen from "../components/settings/SettingsScreen";
import NotificationSettingsScreen from "../components/settings/NotificationSettingsScreen";
import GeneralSettingsScreen from "../components/settings/GeneralSettingsScreen";
import SecuritySettingsScreen from "../components/settings/SecuritySettingsScreen";
import PaymentSettingsScreen from "../components/settings/PaymentSettingsScreen";

export default function AdminDashboard({ navigation, route }) {
    const initialScreen = route?.params?.screen || "Dashboard";
    const [activeScreen, setActiveScreen] = useState(initialScreen);

    useEffect(() => {
        if (route?.params?.screen) {
            setActiveScreen(route.params.screen);
        }
    }, [route?.params?.screen]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dashboard state
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalHomeowners: 0,
        totalTradespeople: 0,
        totalJobs: 0,
        totalLeads: 0,
        revenue: 0,
    });

    // Users state
    const [users, setUsers] = useState([]);
    const [usersSearch, setUsersSearch] = useState("");

    // Categories state
    const [categories, setCategories] = useState([]);

    // Subcategories state
    const [subcategories, setSubcategories] = useState([]);

    // Jobs state
    const [jobs, setJobs] = useState([]);

    // Leads state
    const [leads, setLeads] = useState([]);

    // Verifications state
    const [verifications, setVerifications] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);
    const [verificationStatus, setVerificationStatus] = useState("PENDING_APPROVAL");

    // Filter states
    const [jobStatus, setJobStatus] = useState("ALL");
    const [leadStatus, setLeadStatus] = useState("ALL");

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [showVerificationDetailsModal, setShowVerificationDetailsModal] = useState(false);
    const [selectedTradesperson, setSelectedTradesperson] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Edit states
    const [editingUser, setEditingUser] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editingLead, setEditingLead] = useState(null);

    // Modal states
    const [showJobModal, setShowJobModal] = useState(false);
    const [showLeadModal, setShowLeadModal] = useState(false);

    // Form states
    const [jobForm, setJobForm] = useState({ description: "", homeowner: "", category: "", subCategory: "", city: "", postcode: "", budgetMin: "", budgetMax: "", status: "OPEN" });
    const [leadForm, setLeadForm] = useState({ job: "", tradesperson: "", message: "", priceEstimate: "", status: "PENDING", isUnlocked: false });

    // Form states
    const [userForm, setUserForm] = useState({ name: "", email: "", role: "HOMEOWNER", password: "" });
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [subcategoryForm, setSubcategoryForm] = useState({ name: "", description: "", category: "" });


    useEffect(() => {
        loadData();
    }, [activeScreen]);

    async function loadData() {
        try {
            setLoading(true);

            switch (activeScreen) {
                case "Dashboard":
                    await loadDashboard();
                    break;
                case "Users":
                    await loadUsers();
                    break;
                case "Categories":
                    await loadCategories();
                    break;
                case "Subcategories":
                    await Promise.all([loadSubcategories(), loadCategories()]);
                    break;
                case "Jobs":
                    await Promise.all([loadJobs(), loadCategories(), loadSubcategories(), loadUsers()]);
                    break;
                case "Leads":
                    await Promise.all([loadLeads(), loadJobs(), loadUsers()]);
                    break;
                case "Verifications":
                    await loadVerifications();
                    break;
                case "DeletionRequests":
                    await loadDeletionRequests();
                    break;
                case "Revenue":
                    await loadDashboard(); // Reuse for now or load revenue specific stats
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${activeScreen}:`, error);
        } finally {
            setLoading(false);
        }
    }

    async function loadDashboard() {
        try {
            const data = await adminAPI.getDashboard();
            const dashboardStats = data.data || data;

            setStats({
                totalUsers: dashboardStats.totalUsers || 0,
                totalHomeowners: dashboardStats.totalHomeowners || 0,
                totalTradespeople: dashboardStats.totalTradespeople || 0,
                totalJobs: dashboardStats.totalJobs || 0,
                totalLeads: dashboardStats.totalLeads || 0,
                revenue: dashboardStats.revenue || 0,
            });
        } catch (error) {
            console.error("Dashboard error:", error);
            Alert.alert("Error", "Failed to load dashboard data");
        }
    }

    async function loadUsers() {
        try {
            const data = await adminAPI.getUsers("ALL", 1, 1000);
            const usersList = data.data || data.users || data || [];
            setUsers(Array.isArray(usersList) ? usersList : []);
        } catch (error) {
            console.error("Users error:", error);
            setUsers([]);
        }
    }

    async function loadCategories() {
        try {
            const data = await adminAPI.getCategories();
            const catList = data.data || data.categories || data || [];
            setCategories(Array.isArray(catList) ? catList : []);
        } catch (error) {
            console.error("Categories error:", error);
            setCategories([]);
        }
    }

    async function loadSubcategories() {
        try {
            const data = await adminAPI.getSubcategories();
            const subList = data.data || data.subcategories || data || [];
            setSubcategories(Array.isArray(subList) ? subList : []);
        } catch (error) {
            console.error("Subcategories error:", error);
            setSubcategories([]);
        }
    }

    async function loadJobs() {
        try {
            const data = await adminAPI.getJobs();
            const jobsList = data.data || data.jobs || data || [];
            setJobs(Array.isArray(jobsList) ? jobsList : []);
        } catch (error) {
            console.error("Jobs error:", error);
            setJobs([]);
        }
    }

    async function loadLeads() {
        try {
            const data = await adminAPI.getLeads();
            const leadsList = data.data || data.leads || data || [];
            setLeads(Array.isArray(leadsList) ? leadsList : []);
        } catch (error) {
            console.error("Leads error:", error);
            setLeads([]);
        }
    }

    async function loadVerifications(statusToLoad = null) {
        try {
            const status = statusToLoad || verificationStatus;
            const data = await adminAPI.getTradespersons(status);
            const list = data.data || data || [];
            setVerifications(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Verifications error:", error);
            setVerifications([]);
        }
    }

    async function loadDeletionRequests() {
        try {
            const data = await adminAPI.getDeletionRequests();
            const list = data.data || data.requests || data || [];
            setDeletionRequests(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Deletion requests error:", error);
            setDeletionRequests([]);
        }
    }

    async function handleVerifyTradesperson(profileId, status, reason = "") {
        try {
            setLoading(true);
            await adminAPI.verifyTradesperson({
                profileId,
                status,
                rejectionReason: reason
            });

            Alert.alert("Success", `Account ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
            setRejectionReason("");
            loadVerifications();
        } catch (error) {
            console.error("Verification error:", error);
            Alert.alert("Error", "Failed to process verification");
        } finally {
            setLoading(false);
        }
    }

    async function handleProcessDeletion(requestId, status, message = "") {
        try {
            setLoading(true);
            await adminAPI.processDeletionRequest(requestId, {
                status,
                adminNotes: message
            });

            Alert.alert("Success", `Request ${status.toLowerCase()} successfully`);
            await loadDeletionRequests();
        } catch (error) {
            console.error("Process deletion error:", error);
            Alert.alert("Error", error.message || "Failed to process request");
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteDeletionRequest(requestId) {
        Alert.alert(
            "Delete Request",
            "Are you sure you want to remove this request from the list? This won't delete the user.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteDeletionRequest(requestId);
                            Alert.alert("Success", "Request removed");
                            await loadDeletionRequests();
                        } catch (error) {
                            console.error("Delete request error:", error);
                            Alert.alert("Error", "Failed to delete request");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    }

    // ============================================
    // CRUD HANDLERS - USERS
    // ============================================

    function openCreateUserModal() {
        setEditingUser(null);
        setUserForm({ name: "", email: "", role: "HOMEOWNER", password: "" });
        setShowUserModal(true);
    }

    function openEditUserModal(user) {
        setEditingUser(user);
        setUserForm({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "HOMEOWNER",
            password: "",
        });
        setShowUserModal(true);
    }

    async function handleSaveUser() {
        try {
            if (!userForm.name || !userForm.email) {
                Alert.alert("Error", "Name and email are required");
                return;
            }

            if (!editingUser && !userForm.password) {
                Alert.alert("Error", "Password is required for new users");
                return;
            }

            setLoading(true);
            if (editingUser) {
                // Update existing user
                const updateData = {
                    name: userForm.name,
                    email: userForm.email,
                    role: userForm.role,
                };
                if (userForm.password) {
                    updateData.password = userForm.password;
                }
                await adminAPI.updateUser(editingUser._id, updateData);
                Alert.alert("Success", "User updated successfully");
            } else {
                // Create new user
                await adminAPI.createUser(userForm);
                Alert.alert("Success", "User created successfully");
            }

            setShowUserModal(false);
            await loadUsers();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to save user");
        } finally {
            setLoading(false);
        }
    }

    function handleDeleteUser(user) {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${user.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteUser(user._id);
                            Alert.alert("Success", "User deleted successfully");
                            await loadUsers();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete user");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    // ============================================
    // CRUD HANDLERS - CATEGORIES
    // ============================================

    function openCreateCategoryModal() {
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "" });
        setShowCategoryModal(true);
    }

    function openEditCategoryModal(category) {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name || "",
            description: category.description || "",
        });
        setShowCategoryModal(true);
    }

    async function handleSaveCategory() {
        try {
            if (!categoryForm.name) {
                Alert.alert("Error", "Category name is required");
                return;
            }

            setLoading(true);
            if (editingCategory) {
                // Update existing category
                await adminAPI.updateCategory(editingCategory._id, categoryForm);
                Alert.alert("Success", "Category updated successfully");
            } else {
                // Create new category
                await adminAPI.createCategory(categoryForm);
                Alert.alert("Success", "Category created successfully");
            }

            setShowCategoryModal(false);
            await loadCategories();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to save category");
        } finally {
            setLoading(false);
        }
    }

    function handleDeleteCategory(category) {
        Alert.alert(
            "Delete Category",
            `Are you sure you want to delete ${category.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteCategory(category._id);
                            Alert.alert("Success", "Category deleted successfully");
                            await loadCategories();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete category");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    // ============================================
    // CRUD HANDLERS - SUBCATEGORIES
    // ============================================

    function openCreateSubcategoryModal() {
        setEditingSubcategory(null);
        setSubcategoryForm({ name: "", description: "", category: "" });
        setShowSubcategoryModal(true);
    }

    function openEditSubcategoryModal(subcategory) {
        setEditingSubcategory(subcategory);
        setSubcategoryForm({
            name: subcategory.name || "",
            description: subcategory.description || "",
            category: subcategory.category?._id || subcategory.category || "",
        });
        setShowSubcategoryModal(true);
    }

    async function handleSaveSubcategory() {
        try {
            if (!subcategoryForm.name || !subcategoryForm.category) {
                Alert.alert("Error", "Name and category are required");
                return;
            }

            setLoading(true);
            // Map 'category' to 'categoryId' for backend
            const payload = {
                name: subcategoryForm.name,
                categoryId: subcategoryForm.category,
            };

            if (editingSubcategory) {
                // Update existing subcategory
                await adminAPI.updateSubcategory(editingSubcategory._id, payload);
                Alert.alert("Success", "Subcategory updated successfully");
            } else {
                // Create new subcategory
                await adminAPI.createSubcategory(payload);
                Alert.alert("Success", "Subcategory created successfully");
            }

            setShowSubcategoryModal(false);
            await loadSubcategories();
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to save subcategory");
        } finally {
            setLoading(false);
        }
    }

    function handleDeleteSubcategory(subcategory) {
        Alert.alert(
            "Delete Subcategory",
            `Are you sure you want to delete ${subcategory.name}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteSubcategory(subcategory._id);
                            Alert.alert("Success", "Subcategory deleted successfully");
                            await loadSubcategories();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete subcategory");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // ============================================
    // JOBS CRUD
    // ============================================

    const openCreateJobModal = () => {
        setEditingJob(null);
        setJobForm({ description: "", homeowner: "", category: "", subCategory: "", city: "", postcode: "", budgetMin: "", budgetMax: "", status: "OPEN" });
        setShowJobModal(true);
    };

    const openEditJobModal = (job) => {
        setEditingJob(job);
        setJobForm({
            description: job.description || "",
            homeowner: String(job.homeowner?._id || job.homeowner || ""),
            category: String(job.category?._id || job.category || ""),
            subCategory: String(job.subCategory?._id || job.subCategory || ""),
            city: job.city || job.location?.city || "",
            postcode: job.postcode || job.location?.postcode || "",
            budgetMin: String(job.budgetMin || ""),
            budgetMax: String(job.budgetMax || ""),
            status: job.status || "OPEN",
        });
        setShowJobModal(true);
    };

    const handleSaveJob = async () => {
        try {
            if (!jobForm.description || !jobForm.homeowner || !jobForm.category) {
                Alert.alert("Error", "Please fill description, homeowner and category");
                return;
            }
            setLoading(true);
            const data = {
                ...jobForm,
                budgetMin: Number(jobForm.budgetMin) || 0,
                budgetMax: Number(jobForm.budgetMax) || 0,
            };

            if (editingJob) {
                await adminAPI.updateJob(editingJob._id, data);
                Alert.alert("Success", "Job updated successfully");
            } else {
                await adminAPI.createJob(data);
                Alert.alert("Success", "Job created successfully");
            }
            setShowJobModal(false);
            loadJobs();
        } catch (error) {
            console.error("Save job error:", error);
            Alert.alert("Error", "Failed to save job");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteJob = (jobId) => {
        Alert.alert(
            "Delete Job",
            "Are you sure you want to delete this job and all its leads/messages?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteJob(jobId);
                            Alert.alert("Success", "Job deleted successfully");
                            loadJobs();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete job");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // ============================================
    // LEADS CRUD
    // ============================================

    const openCreateLeadModal = () => {
        setEditingLead(null);
        setLeadForm({ job: "", tradesperson: "", message: "", priceEstimate: "", status: "PENDING", isUnlocked: false });
        setShowLeadModal(true);
    };

    const openEditLeadModal = (lead) => {
        setEditingLead(lead);
        setLeadForm({
            job: String(lead.job?._id || lead.job || ""),
            tradesperson: String(lead.tradesperson?._id || lead.tradesperson || ""),
            message: lead.message || "",
            priceEstimate: String(lead.priceEstimate || ""),
            status: lead.status || "PENDING",
            isUnlocked: !!lead.isUnlocked,
        });
        setShowLeadModal(true);
    };

    const handleSaveLead = async () => {
        try {
            if (!leadForm.job || !leadForm.tradesperson) {
                Alert.alert("Error", "Please select job and tradesperson");
                return;
            }
            setLoading(true);
            const data = {
                ...leadForm,
                priceEstimate: Number(leadForm.priceEstimate) || 0,
            };

            if (editingLead) {
                await adminAPI.updateLead(editingLead._id, data);
                Alert.alert("Success", "Lead updated successfully");
            } else {
                await adminAPI.createLead(data);
                Alert.alert("Success", "Lead created successfully");
            }
            setShowLeadModal(false);
            loadLeads();
        } catch (error) {
            console.error("Save lead error:", error);
            Alert.alert("Error", "Failed to save lead");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLead = (leadId) => {
        Alert.alert(
            "Delete Lead",
            "Are you sure you want to delete this lead?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await adminAPI.deleteLead(leadId);
                            Alert.alert("Success", "Lead deleted successfully");
                            loadLeads();
                        } catch (error) {
                            Alert.alert("Error", "Failed to delete lead");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    // ============================================
    // FLOATING ACTION BUTTON
    // ============================================

    function handleFABPress() {
        switch (activeScreen) {
            case "Users":
                openCreateUserModal();
                break;
            case "Categories":
                openCreateCategoryModal();
                break;
            case "Subcategories":
                openCreateSubcategoryModal();
                break;
            case "Jobs":
                openCreateJobModal();
                break;
            case "Leads":
                openCreateLeadModal();
                break;
        }
    }

    function shouldShowFAB() {
        return ["Users", "Categories", "Subcategories", "Jobs", "Leads"].includes(activeScreen);
    }

    function renderContent() {
        if (loading && !refreshing) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }

        switch (activeScreen) {
            case "Dashboard":
                return <DashboardScreen stats={stats} onNavigate={setActiveScreen} />;
            case "Users":
                return (
                    <UsersScreen
                        users={users}
                        searchQuery={usersSearch}
                        onSearchChange={setUsersSearch}
                        onRefresh={onRefresh}
                        onEdit={openEditUserModal}
                        onDelete={handleDeleteUser}
                    />
                );
            case "Jobs":
                return (
                    <JobsScreen
                        jobs={jobs}
                        status={jobStatus}
                        onStatusChange={setJobStatus}
                        onEdit={openEditJobModal}
                        onDelete={handleDeleteJob}
                    />
                );
            case "Leads":
                return (
                    <LeadsScreen
                        leads={leads}
                        status={leadStatus}
                        onStatusChange={setLeadStatus}
                        onEdit={openEditLeadModal}
                        onDelete={handleDeleteLead}
                    />
                );
            case "Verifications":
                return (
                    <VerificationsScreen
                        verifications={verifications}
                        status={verificationStatus}
                        onStatusChange={(newStatus) => {
                            setVerificationStatus(newStatus);
                            loadVerifications(newStatus);
                        }}
                        onReview={(tp) => {
                            setSelectedTradesperson(tp);
                            setShowVerificationDetailsModal(true);
                        }}
                    // onRefresh removed since we load on tab change and pull-to-refresh is in AdminLayout
                    />
                );
            case "DeletionRequests":
                return (
                    <DeletionRequestsScreen
                        requests={deletionRequests}
                        onProcess={handleProcessDeletion}
                        onDelete={handleDeleteDeletionRequest}
                    />
                );
            case "Categories":
                return (
                    <CategoriesScreen
                        categories={categories}
                        onEdit={openEditCategoryModal}
                        onDelete={handleDeleteCategory}
                    />
                );
            case "Subcategories":
                return (
                    <SubcategoriesScreen
                        subcategories={subcategories}
                        categories={categories}
                        onEdit={openEditSubcategoryModal}
                        onDelete={handleDeleteSubcategory}
                    />
                );
            case "Revenue":
                return <RevenueScreen revenue={stats.revenue} />;
            default:
                return <DashboardScreen stats={stats} onNavigate={setActiveScreen} />;
        }
    }

    return (
        <AdminLayout
            activeScreen={activeScreen}
            onScreenChange={setActiveScreen}
            onCreatePress={shouldShowFAB() ? handleFABPress : null}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#2563EB"]}
                />
            }
        >
            {renderContent()}

            {/* User Modal */}
            <UserFormModal
                visible={showUserModal}
                editing={editingUser}
                formData={userForm}
                onFormChange={setUserForm}
                onSave={handleSaveUser}
                onClose={() => setShowUserModal(false)}
            />

            {/* Category Modal */}
            <CategoryFormModal
                visible={showCategoryModal}
                editing={editingCategory}
                formData={categoryForm}
                onFormChange={setCategoryForm}
                onSave={handleSaveCategory}
                onClose={() => setShowCategoryModal(false)}
            />

            {/* Subcategory Modal */}
            <SubcategoryFormModal
                visible={showSubcategoryModal}
                editing={editingSubcategory}
                formData={subcategoryForm}
                categories={categories}
                onFormChange={setSubcategoryForm}
                onSave={handleSaveSubcategory}
                onClose={() => setShowSubcategoryModal(false)}
            />

            {/* Rejection Reason Modal */}
            <RejectionReasonModal
                visible={showRejectionModal}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
                onConfirm={() => handleVerifyTradesperson(selectedTradesperson?.id, "REJECTED", rejectionReason)}
                onCancel={() => setShowRejectionModal(false)}
            />

            {/* Verification Details Modal */}
            <VerificationDetailsModal
                visible={showVerificationDetailsModal}
                tradesperson={selectedTradesperson}
                onApprove={() => handleVerifyTradesperson(selectedTradesperson?.id, "APPROVED")}
                onReject={() => setShowRejectionModal(true)}
                onClose={() => setShowVerificationDetailsModal(false)}
            />

            {/* Job Form Modal */}
            <JobFormModal
                visible={showJobModal}
                editing={editingJob}
                formData={jobForm}
                users={users}
                categories={categories}
                subcategories={subcategories}
                onFormChange={setJobForm}
                onSave={handleSaveJob}
                onClose={() => setShowJobModal(false)}
            />

            {/* Lead Form Modal */}
            <LeadFormModal
                visible={showLeadModal}
                editing={editingLead}
                formData={leadForm}
                jobs={jobs}
                users={users}
                onFormChange={setLeadForm}
                onSave={handleSaveLead}
                onClose={() => setShowLeadModal(false)}
            />
        </AdminLayout>
    );
}

// ============================================
// DASHBOARD SCREEN
// ============================================
function DashboardScreen({ stats, onNavigate }) {
    return (
        <>
            {/* <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>Admin</Text>
            </View> */}

            <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                    <StatCard
                        title="Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.totalHomeowners} HO • ${stats.totalTradespeople} TP`}
                        icon="users"
                        color="#2563EB"
                        onPress={() => onNavigate("Users")}
                    />
                    <StatCard
                        title="Jobs"
                        value={stats.totalJobs}
                        subtitle="Total posted"
                        icon="briefcase"
                        color="#10B981"
                        onPress={() => onNavigate("Jobs")}
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        title="Leads"
                        value={stats.totalLeads}
                        subtitle="Unlocked"
                        icon="file-text"
                        color="#F59E0B"
                        onPress={() => onNavigate("Leads")}
                    />
                    <StatCard
                        title="Revenue"
                        value={`$${stats.revenue}`}
                        subtitle="Platform"
                        icon="dollar-sign"
                        color="#8B5CF6"
                        onPress={() => onNavigate("Revenue")}
                    />
                </View>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Platform Overview</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Homeowners</Text>
                    <Text style={styles.summaryValue}>{stats.totalHomeowners}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tradespeople</Text>
                    <Text style={styles.summaryValue}>{stats.totalTradespeople}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Active Jobs</Text>
                    <Text style={styles.summaryValue}>{stats.totalJobs}</Text>
                </View>
            </View>
        </>
    );
}

// ============================================
// USERS SCREEN
// ============================================
function UsersScreen({ users, searchQuery, onSearchChange, onEdit, onDelete }) {
    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color="#94A3B8" style={styles.searchIconStyle} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            <Text style={styles.screenTitle}>
                Total Users: {filteredUsers.length}
            </Text>

            {filteredUsers.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="users" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No users found</Text>
                </View>
            ) : (
                filteredUsers.map((user, index) => (
                    <View key={user._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.userAvatar}>
                                {user.profileImage || user.profile_image ? (
                                    <Image
                                        source={{
                                            uri: (user.profileImage || user.profile_image).startsWith('http')
                                                ? (user.profileImage || user.profile_image)
                                                : `${API_BASE_URL}${user.profileImage || user.profile_image}`
                                        }}
                                        style={styles.userAvatarImage}
                                    />
                                ) : (
                                    <Text style={styles.userAvatarText}>
                                        {user.name?.charAt(0) || "U"}
                                    </Text>
                                )}
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{user.name || "Unknown"}</Text>
                                <Text style={styles.cardSubtitle}>{user.email}</Text>
                            </View>
                            <View
                                style={[
                                    styles.roleBadge,
                                    {
                                        backgroundColor:
                                            user.role === "ADMIN"
                                                ? "#EF4444"
                                                : user.role === "TRADESPERSON"
                                                    ? "#2563EB"
                                                    : "#10B981",
                                    },
                                ]}
                            >
                                <Text style={styles.roleBadgeText}>{user.role}</Text>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onEdit(user)}
                            >
                                <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(user)}
                            >
                                <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </>
    );
}

// ============================================
// CATEGORIES SCREEN
// ============================================
function CategoriesScreen({ categories, onEdit, onDelete }) {
    return (
        <>
            <Text style={styles.screenTitle}>
                Total Categories: {categories.length}
            </Text>

            {categories.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="layers" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No categories found</Text>
                </View>
            ) : (
                categories.map((category, index) => (
                    <View key={category._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="layers" size={24} color="#64748B" style={styles.categoryIconStyles} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{category.name}</Text>
                                {category.description && (
                                    <Text style={styles.cardSubtitle}>
                                        {category.description}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onEdit(category)}
                            >
                                <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(category)}
                            >
                                <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </>
    );
}

// ============================================
// SUBCATEGORIES SCREEN
// ============================================
function SubcategoriesScreen({ subcategories, onEdit, onDelete }) {
    return (
        <>
            <Text style={styles.screenTitle}>
                Total Subcategories: {subcategories.length}
            </Text>

            {subcategories.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="list" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No subcategories found</Text>
                </View>
            ) : (
                subcategories.map((subcat, index) => (
                    <View key={subcat._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="list" size={24} color="#64748B" style={styles.categoryIconStyles} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{subcat.name}</Text>
                                <Text style={styles.cardSubtitle}>
                                    Category: {subcat.category?.name || "N/A"}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => onEdit(subcat)}
                            >
                                <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => onDelete(subcat)}
                            >
                                <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </>
    );
}

// ============================================
// JOBS SCREEN
// ============================================
// ============================================
// JOBS SCREEN
// ============================================
function JobsScreen({ jobs, status, onStatusChange, onEdit, onDelete }) {
    const statuses = [
        { label: "All", value: "ALL" },
        { label: "Open", value: "OPEN" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Cancelled", value: "CANCELLED" }
    ];

    const filteredJobs = status === "ALL"
        ? jobs
        : jobs.filter(j => j.status === status);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.statusFilterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {statuses.map((s) => (
                        <TouchableOpacity
                            key={s.value}
                            style={[
                                styles.statusFilterItem,
                                status === s.value && styles.statusFilterItemActive,
                                { paddingHorizontal: wp(4), marginRight: wp(2) }
                            ]}
                            onPress={() => onStatusChange(s.value)}
                        >
                            <Text style={[
                                styles.statusFilterText,
                                status === s.value && styles.statusFilterTextActive
                            ]}>
                                {s.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Text style={styles.screenTitle}>
                {status === "ALL" ? "Total Jobs" : `${status.replace('_', ' ')} Jobs`}: {filteredJobs.length}
            </Text>

            {filteredJobs.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="briefcase" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No jobs found</Text>
                </View>
            ) : (
                filteredJobs.map((job, index) => (
                    <View key={job._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{job.description || "No Description"}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(0.5) }}>
                                    <Feather name="tag" size={12} color="#64748B" />
                                    <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                        {job.category?.name || "Uncategorized"} {job.subCategory?.name ? `> ${job.subCategory.name}` : ""}
                                    </Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            job.status === "COMPLETED" ? "#DCFCE7" :
                                                job.status === "IN_PROGRESS" ? "#FEF3C7" :
                                                    job.status === "CANCELLED" ? "#FEE2E2" : "#EFF6FF",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            job.status === "COMPLETED" ? "#166534" :
                                                job.status === "IN_PROGRESS" ? "#854D0E" :
                                                    job.status === "CANCELLED" ? "#991B1B" : "#1E40AF",
                                    }
                                ]}>
                                    {job.status || "OPEN"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), gap: hp(0.5) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="map-pin" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>{job.location?.city || job.city || "Location N/A"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="dollar-sign" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                    {job.budgetMin ? `£${job.budgetMin}` : "0"} - {job.budgetMax ? `£${job.budgetMax}` : "Any"}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="user" size={12} color="#64748B" />
                                <Text style={[styles.cardSubtitle, { marginLeft: 4 }]}>
                                    {job.homeowner?.name || "Unknown Homeowner"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center' }]}>
                            <Text style={styles.verificationTime}>
                                Added: {job.created_at ? new Date(job.created_at).toLocaleDateString() : "N/A"}
                            </Text>
                            <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(job)}>
                                    <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(job._id)}>
                                    <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

// ============================================
// LEADS SCREEN
// ============================================
function LeadsScreen({ leads, status, onStatusChange, onEdit, onDelete }) {
    const statuses = [
        { label: "All", value: "ALL" },
        { label: "Pending", value: "PENDING" },
        { label: "Hired", value: "HIRED" },
        { label: "Rejected", value: "REJECTED" }
    ];

    const filteredLeads = status === "ALL"
        ? leads
        : leads.filter(l => l.status === status);

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.statusFilterContainer}>
                {statuses.map((s) => (
                    <TouchableOpacity
                        key={s.value}
                        style={[
                            styles.statusFilterItem,
                            status === s.value && styles.statusFilterItemActive
                        ]}
                        onPress={() => onStatusChange(s.value)}
                    >
                        <Text style={[
                            styles.statusFilterText,
                            status === s.value && styles.statusFilterTextActive
                        ]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.screenTitle}>
                {status === "ALL" ? "Total Leads" : `${status} Leads`}: {filteredLeads.length}
            </Text>

            {filteredLeads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="file-text" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No leads found</Text>
                </View>
            ) : (
                filteredLeads.map((lead, index) => (
                    <View key={lead._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>
                                    {lead.tradesperson?.user?.name || "Unknown Tradesperson"}
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    {lead.tradesperson?.companyName || "No Company"}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            lead.status === "HIRED" ? "#DCFCE7" :
                                                lead.status === "REJECTED" ? "#FEE2E2" : "#EFF6FF",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            lead.status === "HIRED" ? "#166534" :
                                                lead.status === "REJECTED" ? "#991B1B" : "#1E40AF",
                                    }
                                ]}>
                                    {lead.status || "PENDING"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), backgroundColor: '#F8FAFC', padding: wp(3), borderRadius: wp(2) }}>
                            <Text style={[styles.cardSubtitle, { fontStyle: 'italic' }]} numberOfLines={3}>
                                "{lead.message || "No message provided."}"
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: hp(1.5) }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="dollar-sign" size={14} color="#2563EB" />
                                <Text style={{ fontSize: normalize(16), fontWeight: '700', color: '#1E293B' }}>
                                    {lead.priceEstimate ? `£${lead.priceEstimate}` : "N/A"}
                                </Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather
                                    name={lead.isUnlocked ? "unlock" : "lock"}
                                    size={14}
                                    color={lead.isUnlocked ? "#10B981" : "#F59E0B"}
                                />
                                <Text style={{
                                    fontSize: normalize(12),
                                    fontWeight: '600',
                                    color: lead.isUnlocked ? "#10B981" : "#F59E0B",
                                    marginLeft: 4
                                }}>
                                    {lead.isUnlocked ? "Unlocked" : "Locked"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center' }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: normalize(12), color: '#94A3B8' }} numberOfLines={1}>
                                    Job: {lead.job?.description || "Deleted Job"}
                                </Text>
                                <Text style={styles.verificationTime}>
                                    Applied: {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "N/A"}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: wp(2) }}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(lead)}>
                                    <Feather name="edit-2" size={14} color="#2563EB" style={styles.buttonIcon} />
                                    <Text style={styles.actionButtonText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => onDelete(lead._id)}>
                                    <Feather name="trash-2" size={14} color="#EF4444" style={styles.buttonIcon} />
                                    <Text style={styles.deleteButtonText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

// ============================================
// REVENUE SCREEN
// ============================================
function RevenueScreen({ revenue }) {
    return (
        <>
            <View style={styles.revenueCard}>
                <Feather name="dollar-sign" size={48} color="#2563EB" style={styles.revenueIconStyle} />
                <Text style={styles.revenueAmount}>${revenue}</Text>
                <Text style={styles.revenueLabel}>Total Platform Revenue</Text>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Revenue Breakdown</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                    <Text style={styles.summaryValue}>${revenue}</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>This Month</Text>
                    <Text style={styles.summaryValue}>
                        ${Math.floor(revenue * 0.3)}
                    </Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Last Month</Text>
                    <Text style={styles.summaryValue}>
                        ${Math.floor(revenue * 0.25)}
                    </Text>
                </View>
            </View>

        </>
    );
}

// ============================================
// DELETION REQUESTS SCREEN
// ============================================
function DeletionRequestsScreen({ requests, onProcess, onDelete }) {
    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.screenTitle}>
                Account Deletion Requests ({requests.length})
            </Text>

            {requests.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="trash-2" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No pending requests</Text>
                </View>
            ) : (
                requests.map((request, index) => (
                    <View key={request._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{request.user?.name || "Unknown User"}</Text>
                                <Text style={styles.cardSubtitle}>{request.user?.email}</Text>
                                <View style={[styles.roleBadge, { marginTop: 4, alignSelf: 'flex-start', backgroundColor: request.user?.role === 'TRADESPERSON' ? '#2563EB' : '#10B981' }]}>
                                    <Text style={styles.roleBadgeText}>{request.user?.role}</Text>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            request.status === "APPROVED" ? "#DCFCE7" :
                                                request.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                                    },
                                ]}
                            >
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            request.status === "APPROVED" ? "#166534" :
                                                request.status === "REJECTED" ? "#991B1B" : "#854D0E",
                                    }
                                ]}>
                                    {request.status || "PENDING"}
                                </Text>
                            </View>
                        </View>

                        <View style={{ marginTop: hp(1), backgroundColor: '#F8FAFC', padding: wp(3), borderRadius: wp(2) }}>
                            <Text style={styles.infoLabel}>Reason:</Text>
                            <Text style={[styles.cardSubtitle, { color: '#1E293B', marginTop: 2 }]}>
                                {request.reason || "No reason provided."}
                            </Text>
                        </View>

                        {request.status === "PENDING" && (
                            <View style={[styles.cardActions, { marginTop: hp(2) }]}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#DCFCE7', borderColor: '#DCFCE7' }]}
                                    onPress={() => onProcess(request._id, "APPROVED")}
                                >
                                    <Feather name="check-circle" size={14} color="#166534" style={styles.buttonIcon} />
                                    <Text style={[styles.actionButtonText, { color: '#166534' }]}>Approve & Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: '#FEE2E2', borderColor: '#FEE2E2' }]}
                                    onPress={() => onProcess(request._id, "REJECTED")}
                                >
                                    <Feather name="x-circle" size={14} color="#991B1B" style={styles.buttonIcon} />
                                    <Text style={[styles.actionButtonText, { color: '#991B1B' }]}>Reject</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <View style={[styles.cardActions, { justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: hp(1) }]}>
                            <Text style={styles.verificationTime}>
                                Sent: {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "N/A"}
                            </Text>
                            <TouchableOpacity onPress={() => onDelete(request._id)}>
                                <Feather name="trash-2" size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}
        </View>
    );
}

// ============================================
// SEO SCREEN
// ============================================
// function SEOScreen() {
//     return (
//         <>
//             <Text style={styles.screenTitle}>SEO Management</Text>
//             <View style={styles.infoCard}>
//                 <Feather name="search" size={48} color="#2563EB" style={styles.infoIconStyle} />
//                 <Text style={styles.infoTitle}>SEO Settings</Text>
//                 <Text style={styles.infoText}>
//                     Manage meta tags, descriptions, and search engine optimization settings for your platform.
//                 </Text>
//             </View>
//         </>
//     );
// }

// ============================================
// SETTINGS SCREEN MOVED TO SEPARATE FILE
// ============================================

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ title, value, subtitle, icon, color, onPress }) {
    return (
        <TouchableOpacity
            style={[styles.statCard, { borderLeftColor: color, backgroundColor: `${color}08` }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Feather name={icon} size={24} color={color} style={styles.statIconStyle} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </TouchableOpacity>
    );
}

// ============================================
// MODAL COMPONENTS
// ============================================

// User Form Modal
function UserFormModal({ visible, editing, formData, onFormChange, onSave, onClose }) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit User" : "Create User"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter name"
                            value={formData.name}
                            onChangeText={(text) => onFormChange({ ...formData, name: text })}
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter email"
                            value={formData.email}
                            onChangeText={(text) => onFormChange({ ...formData, email: text })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Role *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.role}
                                onValueChange={(value) => onFormChange({ ...formData, role: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Homeowner" value="HOMEOWNER" />
                                <Picker.Item label="Tradesperson" value="TRADESPERSON" />
                                <Picker.Item label="Admin" value="ADMIN" />
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>
                            Password {editing ? "(leave blank to keep current)" : "*"}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter password"
                            value={formData.password}
                            onChangeText={(text) => onFormChange({ ...formData, password: text })}
                            secureTextEntry
                            placeholderTextColor="#94A3B8"
                        />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Category Form Modal
function CategoryFormModal({ visible, editing, formData, onFormChange, onSave, onClose }) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit Category" : "Create Category"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter category name"
                            value={formData.name}
                            onChangeText={(text) => onFormChange({ ...formData, name: text })}
                            placeholderTextColor="#94A3B8"
                        />
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Subcategory Form Modal
function SubcategoryFormModal({ visible, editing, formData, categories, onFormChange, onSave, onClose }) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit Subcategory" : "Create Subcategory"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter subcategory name"
                            value={formData.name}
                            onChangeText={(text) => onFormChange({ ...formData, name: text })}
                            placeholderTextColor="#94A3B8"
                        />
                        <Text style={styles.inputLabel}>Category *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.category}
                                onValueChange={(value) => onFormChange({ ...formData, category: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select a category" value="" />
                                {categories.map((cat) => (
                                    <Picker.Item
                                        key={cat._id}
                                        label={cat.name}
                                        value={cat._id}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </ScrollView>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Job Form Modal
function JobFormModal({ visible, editing, formData, users, categories, subcategories, onFormChange, onSave, onClose }) {
    const homeowners = users.filter(u => u.role === "HOMEOWNER");
    const filteredSubcategories = subcategories.filter(s => String(s.category?._id || s.category) === String(formData.category));

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit Job" : "Create Job"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter job description"
                            value={formData.description}
                            onChangeText={(text) => onFormChange({ ...formData, description: text })}
                            multiline
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Homeowner *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.homeowner}
                                onValueChange={(value) => onFormChange({ ...formData, homeowner: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Homeowner" value="" />
                                {homeowners.map((u) => (
                                    <Picker.Item key={u._id} label={`${u.name} (${u.email})`} value={u._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Category *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.category}
                                onValueChange={(value) => onFormChange({ ...formData, category: value, subCategory: "" })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((c) => (
                                    <Picker.Item key={c._id} label={c.name} value={c._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Subcategory *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.subCategory}
                                onValueChange={(value) => onFormChange({ ...formData, subCategory: value })}
                                style={styles.picker}
                                disabled={!formData.category}
                            >
                                <Picker.Item label="Select Subcategory" value="" />
                                {filteredSubcategories.map((s) => (
                                    <Picker.Item key={s._id} label={s.name} value={s._id} />
                                ))}
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', gap: wp(3) }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>City</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="City"
                                    value={formData.city}
                                    onChangeText={(text) => onFormChange({ ...formData, city: text })}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Postcode</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Postcode"
                                    value={formData.postcode}
                                    onChangeText={(text) => onFormChange({ ...formData, postcode: text })}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: wp(3) }}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Min Budget (£)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Min"
                                    value={formData.budgetMin}
                                    onChangeText={(text) => onFormChange({ ...formData, budgetMin: text })}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.inputLabel}>Max Budget (£)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Max"
                                    value={formData.budgetMax}
                                    onChangeText={(text) => onFormChange({ ...formData, budgetMax: text })}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <Text style={styles.inputLabel}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(value) => onFormChange({ ...formData, status: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Open" value="OPEN" />
                                <Picker.Item label="In Progress" value="IN_PROGRESS" />
                                <Picker.Item label="Completed" value="COMPLETED" />
                                <Picker.Item label="Cancelled" value="CANCELLED" />
                            </Picker>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Lead Form Modal
function LeadFormModal({ visible, editing, formData, jobs, users, onFormChange, onSave, onClose }) {
    // Note: tradesperson in leads table refers to TradespersonProfile ID
    // But for admin convenience, we should probably map users with role TRADESPERSON
    // In this app, the users with role TRADESPERSON have a linked profile.
    // However, the tradesperson list we have is from adminAPI.getUsers which are USERS.
    // We might need to fetch tradesperson profiles separately if the backend creator needs the profile ID.
    // Let's assume for now the backend handles either or that we need to be careful.
    // Looking at lead.tradesperson.user.name earlier suggests it's nested.

    // For simplicity, let's filter users who are tradespeople
    const tradespeople = users.filter(u => u.role === "TRADESPERSON");

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {editing ? "Edit Lead" : "Create Lead"}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                            <Feather name="x" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Job *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.job}
                                onValueChange={(value) => onFormChange({ ...formData, job: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Job" value="" />
                                {jobs.map((j) => (
                                    <Picker.Item key={j._id} label={j.description} value={j._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Tradesperson *</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.tradesperson}
                                onValueChange={(value) => onFormChange({ ...formData, tradesperson: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Tradesperson" value="" />
                                {tradespeople.map((u) => (
                                    <Picker.Item key={u._id} label={u.name} value={u.tradesperson_profile_id || u._id} />
                                ))}
                            </Picker>
                        </View>

                        <Text style={styles.inputLabel}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter quote message"
                            value={formData.message}
                            onChangeText={(text) => onFormChange({ ...formData, message: text })}
                            multiline
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Price Estimate (£)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter estimate"
                            value={formData.priceEstimate}
                            onChangeText={(text) => onFormChange({ ...formData, priceEstimate: text })}
                            keyboardType="numeric"
                            placeholderTextColor="#94A3B8"
                        />

                        <Text style={styles.inputLabel}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={formData.status}
                                onValueChange={(value) => onFormChange({ ...formData, status: value })}
                                style={styles.picker}
                            >
                                <Picker.Item label="Pending" value="PENDING" />
                                <Picker.Item label="Hired" value="HIRED" />
                                <Picker.Item label="Rejected" value="REJECTED" />
                            </Picker>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2) }}>
                            <TouchableOpacity
                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => onFormChange({ ...formData, isUnlocked: !formData.isUnlocked })}
                            >
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderWidth: 1,
                                    borderColor: '#2563EB',
                                    borderRadius: 4,
                                    backgroundColor: formData.isUnlocked ? '#2563EB' : 'transparent',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 8
                                }}>
                                    {formData.isUnlocked && <Feather name="check" size={14} color="#FFFFFF" />}
                                </View>
                                <Text style={{ fontSize: normalize(14), color: '#1E293B' }}>Is Unlocked</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
                            <Text style={styles.saveButtonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: "#64748B",
    },
    welcomeSection: {
        marginBottom: 24,
    },
    welcomeText: {
        fontSize: 14,
        color: "#64748B",
    },
    userName: {
        fontSize: normalize(24),
        fontWeight: "700",
        color: "#1E293B",
        marginTop: hp(0.5),
    },
    statsGrid: {
        marginBottom: hp(2.5),
    },
    statsRow: {
        flexDirection: "row",
        gap: wp(3),
        marginBottom: hp(1.5),
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(4),
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    statIconStyle: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: normalize(22),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    statTitle: {
        fontSize: normalize(12),
        color: "#64748B",
        fontWeight: "600",
    },
    statSubtitle: {
        fontSize: normalize(10),
        color: "#94A3B8",
        marginTop: hp(0.2),
    },
    summaryCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: hp(1.5),
    },
    summaryLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
    },
    summaryDivider: {
        height: 1,
        backgroundColor: "#E2E8F0",
    },
    screenTitle: {
        fontSize: normalize(18),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(2),
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIconStyle: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(16),
        color: "#1E293B",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
    },
    cardTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    cardSubtitle: {
        fontSize: normalize(14), // reduced from 16 for better fit
        color: "#64748B",
    },
    userAvatar: {
        width: wp(12),
        height: wp(12),
        borderRadius: wp(6),
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    userAvatarText: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    userAvatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: wp(6),
    },
    categoryIconStyle: {
        marginRight: 4,
    },
    roleBadge: {
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(3),
    },
    roleBadgeText: {
        fontSize: normalize(10),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statusBadge: {
        paddingHorizontal: wp(2.5),
        paddingVertical: hp(0.5),
        borderRadius: wp(2),
    },
    statusBadgeText: {
        fontSize: normalize(10),
        fontWeight: "700",
        color: "#FFFFFF",
    },
    unlockIcon: {
        marginLeft: 8,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: hp(8),
    },
    emptyIconStyle: {
        marginBottom: hp(2),
    },
    emptyText: {
        fontSize: normalize(16),
        color: "#94A3B8",
    },
    revenueCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        padding: wp(8),
        alignItems: "center",
        marginBottom: hp(2.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    revenueIconStyle: {
        marginBottom: hp(2),
    },
    revenueAmount: {
        fontSize: normalize(40),
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: hp(1),
    },
    revenueLabel: {
        fontSize: normalize(14),
        color: "#64748B",
    },
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoIconStyle: {
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingIconStyle: {
        marginRight: wp(4),
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: hp(0.5),
    },
    settingSubtitle: {
        fontSize: normalize(13),
        color: "#64748B",
    },
    settingArrow: {
        fontSize: 24,
        color: "#94A3B8",
    },
    // Card action buttons
    cardActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(2),
        marginTop: hp(1.5),
        paddingTop: hp(1.5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(2),
        backgroundColor: "#EFF6FF",
    },
    actionButtonText: {
        fontSize: normalize(13),
        color: "#2563EB",
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#FEE2E2",
    },
    deleteButtonText: {
        fontSize: normalize(13),
        color: "#EF4444",
        fontWeight: "600",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        maxHeight: "80%",
        backgroundColor: "#FFFFFF",
        borderRadius: wp(4),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: wp(5),
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: normalize(20),
        fontWeight: "700",
        color: "#1E293B",
    },
    modalClose: {
        fontSize: normalize(28),
        color: "#64748B",
        fontWeight: "300",
    },
    modalBody: {
        padding: wp(5),
        maxHeight: hp(50),
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: wp(3),
        padding: wp(5),
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    inputLabel: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#475569",
        marginBottom: hp(1),
        marginTop: hp(1.5),
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        padding: wp(3),
        fontSize: normalize(16),
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
    },
    textArea: {
        minHeight: hp(12),
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: wp(2),
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    picker: {
        height: hp(6),
        color: "#1E293B",
    },
    infoLabel: {
        fontSize: normalize(12),
        fontWeight: "700",
        color: "#64748B",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    cancelButton: {
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        backgroundColor: "#F1F5F9",
    },
    cancelButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#64748B",
    },
    // Icon styles
    searchIconStyle: {
        marginRight: 12,
    },
    emptyIconStyle: {
        marginBottom: 16,
    },
    buttonIcon: {
        marginRight: 4,
    },
    categoryIconStyle: {
        marginRight: 4,
    },
    revenueIconStyle: {
        marginBottom: 16,
    },
    infoIconStyle: {
        marginBottom: 16,
    },
    settingIconStyle: {
        marginRight: 16,
    },
    statIconStyle: {
        marginBottom: 8,
    },
    saveButton: {
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        backgroundColor: "#2563EB",
    },
    saveButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#FFFFFF",
    },
    // Verification Screen Styles
    statusFilterContainer: {
        flexDirection: "row",
        backgroundColor: "#F1F5F9",
        borderRadius: wp(2),
        padding: wp(1),
        marginBottom: hp(2),
    },
    statusFilterItem: {
        flex: 1,
        paddingVertical: hp(1),
        alignItems: "center",
        borderRadius: wp(1.5),
    },
    statusFilterItemActive: {
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statusFilterText: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#64748B",
    },
    statusFilterTextActive: {
        color: "#2563EB",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: hp(10),
    },
    emptyText: {
        fontSize: normalize(16),
        color: "#94A3B8",
        marginTop: hp(2),
    },
    verificationCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(2),
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    verificationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: hp(1.5),
    },
    verificationInfo: {
        flex: 1,
    },
    verificationName: {
        fontSize: normalize(16),
        fontWeight: "700",
        color: "#1E293B",
    },
    verificationCompany: {
        fontSize: normalize(14),
        color: "#64748B",
        marginTop: hp(0.2),
    },
    statusBadge: {
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.5),
        borderRadius: wp(1),
    },
    statusBadgeText: {
        fontSize: normalize(11),
        fontWeight: "700",
    },
    verificationFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: hp(1),
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
    },
    verificationTime: {
        fontSize: normalize(12),
        color: "#94A3B8",
    },
    reviewButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2563EB",
        paddingHorizontal: wp(3),
        paddingVertical: hp(0.8),
        borderRadius: wp(1.5),
    },
    reviewButtonText: {
        fontSize: normalize(12),
        fontWeight: "600",
        color: "#FFFFFF",
    },
    detailSection: {
        marginBottom: hp(2.5),
    },
    detailLabel: {
        fontSize: normalize(14),
        fontWeight: "600",
        color: "#64748B",
        marginBottom: hp(0.8),
    },
    detailValue: {
        fontSize: normalize(16),
        color: "#1E293B",
    },
    documentLink: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        padding: wp(3),
        borderRadius: wp(2),
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: hp(1),
    },
    documentIcon: {
        marginRight: wp(3),
    },
    documentText: {
        fontSize: normalize(14),
        color: "#2563EB",
        fontWeight: "500",
        flex: 1,
    },
    noDocument: {
        fontSize: normalize(14),
        color: "#94A3B8",
        fontStyle: "italic",
    },
    rejectButton: {
        flex: 1,
        backgroundColor: "#FEE2E2",
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: "center",
    },
    rejectButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#EF4444",
    },
    approveButton: {
        flex: 2,
        backgroundColor: "#10B981",
        paddingVertical: hp(1.5),
        borderRadius: wp(2),
        alignItems: "center",
    },
    approveButtonText: {
        fontSize: normalize(16),
        fontWeight: "600",
        color: "#FFFFFF",
    },
});

// ============================================
// VERIFICATIONS SCREEN
// ============================================
function VerificationsScreen({ verifications, status, onStatusChange, onReview, onRefresh }) {
    const statuses = [
        { label: "Pending", value: "PENDING_APPROVAL" },
        { label: "Approved", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" }
    ];

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.statusFilterContainer}>
                {statuses.map((s) => (
                    <TouchableOpacity
                        key={s.value}
                        style={[
                            styles.statusFilterItem,
                            status === s.value && styles.statusFilterItemActive
                        ]}
                        onPress={() => onStatusChange(s.value)}
                    >
                        <Text style={[
                            styles.statusFilterText,
                            status === s.value && styles.statusFilterTextActive
                        ]}>
                            {s.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {verifications.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Feather name="shield" size={48} color="#CBD5E1" />
                    <Text style={styles.emptyText}>No applications found</Text>
                </View>
            ) : (
                verifications.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.verificationCard}
                        onPress={() => onReview(item)}
                    >
                        <View style={styles.verificationHeader}>
                            <View style={styles.verificationInfo}>
                                <Text style={styles.verificationName}>{item.name}</Text>
                                <Text style={styles.verificationCompany}>{item.company_name}</Text>
                            </View>
                            <View style={[
                                styles.statusBadge,
                                {
                                    backgroundColor:
                                        item.verification_status === "APPROVED" ? "#DCFCE7" :
                                            item.verification_status === "REJECTED" ? "#FEE2E2" : "#FEF3C7"
                                }
                            ]}>
                                <Text style={[
                                    styles.statusBadgeText,
                                    {
                                        color:
                                            item.verification_status === "APPROVED" ? "#166534" :
                                                item.verification_status === "REJECTED" ? "#991B1B" : "#854D0E"
                                    }
                                ]}>
                                    {item.verification_status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.verificationFooter}>
                            <Text style={styles.verificationTime}>
                                Submitted: {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                            <View style={styles.reviewButton}>
                                <Text style={styles.reviewButtonText}>Review</Text>
                                <Feather name="chevron-right" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}
        </View>
    );
}

// ============================================
// VERIFICATION DETAILS MODAL
// ============================================
function VerificationDetailsModal({ visible, tradesperson, onApprove, onReject, onClose }) {
    if (!tradesperson) return null;

    const handleOpenDocument = async (path) => {
        if (!path) return;
        // Ensure path starts with / if it's relative
        const formattedPath = path.startsWith('http') ? path : (path.startsWith('/') ? path : `/${path}`);
        const url = path.startsWith('http') ? path : `${API_BASE_URL}${formattedPath}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Don't know how to open this URL: " + url);
            }
        } catch (error) {
            Alert.alert("Error", "Could not open document");
            console.error(error);
        }
    };

    const renderDocument = (label, path) => (
        <View style={{ marginBottom: 12 }}>
            <Text style={styles.detailLabel}>{label}</Text>
            {path ? (
                <TouchableOpacity
                    style={styles.documentLink}
                    onPress={() => handleOpenDocument(path)}
                >
                    <Feather name="file-text" size={20} color="#2563EB" style={styles.documentIcon} />
                    <Text style={styles.documentText} numberOfLines={1}>{path.split('/').pop()}</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.noDocument}>Not provided</Text>
            )}
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Review Application</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.modalClose}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Tradesperson Name</Text>
                            <Text style={styles.detailValue}>{tradesperson.name}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Company Name</Text>
                            <Text style={styles.detailValue}>{tradesperson.company_name}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Email</Text>
                            <Text style={styles.detailValue}>{tradesperson.email}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={styles.detailLabel}>Phone</Text>
                            <Text style={styles.detailValue}>{tradesperson.phone || "N/A"} {tradesperson.phone_verified ? "(Verified)" : "(Unverified)"}</Text>
                        </View>

                        <View style={styles.detailSection}>
                            <Text style={[styles.detailLabel, { marginBottom: 12 }]}>Documents</Text>
                            {renderDocument("Government ID", tradesperson.id_document)}
                            {renderDocument("Insurance Certificate", tradesperson.insurance_document)}
                            {renderDocument("Trade License", tradesperson.license_document)}
                        </View>

                        {tradesperson.verification_status === "REJECTED" && tradesperson.rejection_reason && (
                            <View style={[styles.detailSection, { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8 }]}>
                                <Text style={[styles.detailLabel, { color: "#991B1B" }]}>Previous Rejection Reason</Text>
                                <Text style={{ color: "#991B1B" }}>{tradesperson.rejection_reason}</Text>
                            </View>
                        )}
                    </ScrollView>

                    {tradesperson.verification_status === "PENDING_APPROVAL" && (
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
                                <Text style={styles.rejectButtonText}>Reject</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
                                <Text style={styles.approveButtonText}>Approve Account</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

// ============================================
// REJECTION REASON MODAL
// ============================================
function RejectionReasonModal({ visible, reason, onReasonChange, onConfirm, onCancel }) {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { maxHeight: hp(40) }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Rejection Reason</Text>
                    </View>
                    <View style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Please provide a reason for rejection:</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            placeholder="e.g., ID document is expired or blurry"
                            value={reason}
                            onChangeText={onReasonChange}
                        />
                    </View>
                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: "#EF4444" }]}
                            onPress={onConfirm}
                            disabled={!reason.trim()}
                        >
                            <Text style={styles.saveButtonText}>Confirm Reject</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
