import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import { adminAPI } from "../services/api";
import { Feather } from "@expo/vector-icons";
import { normalize, wp, hp } from "../utils/responsive";
import AdminLayout from "../components/admin/AdminLayout";

// Import Modular Screens
import DashboardScreen from './admin/DashboardScreen';
import UsersScreen from './admin/UsersScreen';
import CategoriesScreen from './admin/CategoriesScreen';
import SubcategoriesScreen from './admin/SubcategoriesScreen';
import JobsScreen from './admin/JobsScreen';
import LeadsScreen from './admin/LeadsScreen';
import RevenueScreen from './admin/RevenueScreen';
import DeletionRequestsScreen from './admin/DeletionRequestsScreen';
import VerificationsScreen from './admin/VerificationsScreen';

// Import Modular Modals
import UserFormModal from '../components/admin/modals/UserFormModal';
import CategoryFormModal from '../components/admin/modals/CategoryFormModal';
import SubcategoryFormModal from '../components/admin/modals/SubcategoryFormModal';
import JobFormModal from '../components/admin/modals/JobFormModal';
import LeadFormModal from '../components/admin/modals/LeadFormModal';
import RejectionReasonModal from '../components/admin/modals/RejectionReasonModal';
import VerificationDetailsModal from '../components/admin/modals/VerificationDetailsModal';

// Other sub-screens that are already separate
import AdminProfileScreen from "./admin/AdminProfileScreen";
import AdminEditProfileScreen from "./admin/AdminEditProfileScreen";
import SettingsScreen from "../components/settings/SettingsScreen";
import NotificationSettingsScreen from "../components/settings/NotificationSettingsScreen";
import GeneralSettingsScreen from "../components/settings/GeneralSettingsScreen";
import SecuritySettingsScreen from "../components/settings/SecuritySettingsScreen";
import PaymentSettingsScreen from "../components/settings/PaymentSettingsScreen";
import ChangePasswordScreen from "./ChangePasswordScreen";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import TermsAndConditionsScreen from "./TermsAndConditionsScreen";

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

    // Data lists
    const [users, setUsers] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [leads, setLeads] = useState([]);
    const [verifications, setVerifications] = useState([]);
    const [deletionRequests, setDeletionRequests] = useState([]);

    // Search and Filters
    const [usersSearch, setUsersSearch] = useState("");
    const [jobStatus, setJobStatus] = useState("ALL");
    const [leadStatus, setLeadStatus] = useState("ALL");
    const [verificationStatus, setVerificationStatus] = useState("PENDING_APPROVAL");

    // Modal Control
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showRejectionModal, setShowRejectionModal] = useState(false);

    // Selected items for editing/review
    const [editingUser, setEditingUser] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editingLead, setEditingLead] = useState(null);
    const [selectedTradesperson, setSelectedTradesperson] = useState(null);

    // Form states
    const [userForm, setUserForm] = useState({ name: "", email: "", role: "HOMEOWNER", password: "" });
    const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
    const [subcategoryForm, setSubcategoryForm] = useState({ name: "", category: "" });
    const [jobForm, setJobForm] = useState({ description: "", homeowner: "", category: "", subCategory: "", city: "", postcode: "", budgetMin: "", budgetMax: "", status: "OPEN" });
    const [leadForm, setLeadForm] = useState({ job: "", tradesperson: "", message: "", priceEstimate: "", status: "PENDING", isUnlocked: false });
    const [rejectionReason, setRejectionReason] = useState("");

    useEffect(() => {
        loadData();
    }, [activeScreen]);

    async function loadData() {
        try {
            setLoading(true);
            switch (activeScreen) {
                case "Dashboard":
                    await Promise.all([loadDashboard(), loadDeletionRequests()]);
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
                    await loadDashboard();
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${activeScreen}:`, error);
        } finally {
            setLoading(false);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    // Data loading functions
    async function loadDashboard() {
        try {
            const data = await adminAPI.getDashboard();
            const s = data.data || data;
            setStats({
                totalUsers: s.totalUsers || 0,
                totalHomeowners: s.totalHomeowners || 0,
                totalTradespeople: s.totalTradespeople || 0,
                totalJobs: s.totalJobs || 0,
                totalLeads: s.totalLeads || 0,
                revenue: s.revenue || 0,
            });
        } catch (error) {
            console.error("Dashboard error:", error);
        }
    }

    async function loadUsers() {
        try {
            const data = await adminAPI.getUsers("ALL", 1, 1000);
            const list = data.data || data.users || data || [];
            setUsers(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Users error:", error);
            setUsers([]);
        }
    }

    async function loadCategories() {
        try {
            const data = await adminAPI.getCategories();
            const list = data.data || data.categories || data || [];
            setCategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Categories error:", error);
            setCategories([]);
        }
    }

    async function loadSubcategories() {
        try {
            const data = await adminAPI.getSubcategories();
            const list = data.data || data.subcategories || data || [];
            setSubcategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Subcategories error:", error);
            setSubcategories([]);
        }
    }

    async function loadJobs() {
        try {
            const data = await adminAPI.getJobs();
            const list = data.data || data.jobs || data || [];
            setJobs(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error("Jobs error:", error);
            setJobs([]);
        }
    }

    async function loadLeads() {
        try {
            const data = await adminAPI.getLeads();
            const list = data.data || data.leads || data || [];
            setLeads(Array.isArray(list) ? list : []);
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

    // CRUD - Users
    const handleSaveUser = async () => {
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
                await adminAPI.updateUser(editingUser._id, userForm);
                Alert.alert("Success", "User updated successfully");
            } else {
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
    };

    const handleDeleteUser = (user) => {
        Alert.alert("Delete User", `Are you sure you want to delete ${user.name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteUser(user._id);
                        Alert.alert("Success", "User deleted successfully");
                        await loadUsers();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete user");
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    // CRUD - Categories
    const handleSaveCategory = async () => {
        try {
            if (!categoryForm.name) {
                Alert.alert("Error", "Category name is required");
                return;
            }
            setLoading(true);
            if (editingCategory) {
                await adminAPI.updateCategory(editingCategory._id, categoryForm);
                Alert.alert("Success", "Category updated successfully");
            } else {
                await adminAPI.createCategory(categoryForm);
                Alert.alert("Success", "Category created successfully");
            }
            setShowCategoryModal(false);
            await loadCategories();
        } catch (error) {
            Alert.alert("Error", "Failed to save category");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = (cat) => {
        Alert.alert("Delete Category", `Are you sure you want to delete ${cat.name}?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteCategory(cat._id);
                        Alert.alert("Success", "Category deleted");
                        await loadCategories();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete category");
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    // CRUD - Subcategories
    const handleSaveSubcategory = async () => {
        try {
            if (!subcategoryForm.name || !subcategoryForm.category) {
                Alert.alert("Error", "Name and category are required");
                return;
            }
            setLoading(true);
            const payload = { name: subcategoryForm.name, categoryId: subcategoryForm.category };
            if (editingSubcategory) {
                await adminAPI.updateSubcategory(editingSubcategory._id, payload);
                Alert.alert("Success", "Subcategory updated");
            } else {
                await adminAPI.createSubcategory(payload);
                Alert.alert("Success", "Subcategory created");
            }
            setShowSubcategoryModal(false);
            await loadSubcategories();
        } catch (error) {
            Alert.alert("Error", "Failed to save subcategory");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSubcategory = (sub) => {
        Alert.alert("Delete Subcategory", `Are you sure?`, [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteSubcategory(sub._id);
                        await loadSubcategories();
                    } catch (error) {
                        Alert.alert("Error", "Failed to delete subcategory");
                    } finally { setLoading(false); }
                }
            }
        ]);
    };

    // CRUD - Jobs
    const handleSaveJob = async () => {
        try {
            if (!jobForm.description || !jobForm.homeowner) {
                Alert.alert("Error", "Description and homeowner are required");
                return;
            }
            setLoading(true);
            const payload = { ...jobForm, budgetMin: Number(jobForm.budgetMin) || 0, budgetMax: Number(jobForm.budgetMax) || 0 };
            if (editingJob) {
                await adminAPI.updateJob(editingJob._id, payload);
            } else {
                await adminAPI.createJob(payload);
            }
            setShowJobModal(false);
            loadJobs();
        } catch (error) { Alert.alert("Error", "Failed to save job"); }
        finally { setLoading(false); }
    };

    const handleDeleteJob = (jobId) => {
        Alert.alert("Delete Job", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteJob(jobId);
                        loadJobs();
                    } catch (error) { Alert.alert("Error", "Failed to delete"); }
                    finally { setLoading(false); }
                }
            }
        ]);
    };

    // CRUD - Leads
    const handleSaveLead = async () => {
        try {
            if (!leadForm.job || !leadForm.tradesperson) {
                Alert.alert("Error", "Job and Tradesperson are required");
                return;
            }
            setLoading(true);
            const payload = { ...leadForm, priceEstimate: Number(leadForm.priceEstimate) || 0 };
            if (editingLead) {
                await adminAPI.updateLead(editingLead._id, payload);
            } else {
                await adminAPI.createLead(payload);
            }
            setShowLeadModal(false);
            loadLeads();
        } catch (error) { Alert.alert("Error", "Failed to save lead"); }
        finally { setLoading(false); }
    };

    const handleDeleteLead = (leadId) => {
        Alert.alert("Delete Lead", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteLead(leadId);
                        loadLeads();
                    } catch (error) { Alert.alert("Error", "Failed to delete lead"); }
                    finally { setLoading(false); }
                }
            }
        ]);
    };

    // Verification Logic
    const handleVerifyTradesperson = async (profileId, status, reason = "") => {
        try {
            setLoading(true);
            await adminAPI.verifyTradesperson({ profileId, status, rejectionReason: reason });
            Alert.alert("Success", `Account ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
            setRejectionReason("");
            setShowRejectionModal(false);
            setShowVerificationModal(false);
            loadVerifications();
        } catch (error) { Alert.alert("Error", "Failed to process verification"); }
        finally { setLoading(false); }
    };

    // Deletion Request Logic
    const handleProcessDeletion = async (requestId, status) => {
        try {
            setLoading(true);
            await adminAPI.processDeletionRequest(requestId, { status });
            Alert.alert("Success", "Request processed");
            loadDeletionRequests();
        } catch (error) { Alert.alert("Error", "Failed to process request"); }
        finally { setLoading(false); }
    };

    const handleDeleteRequest = async (requestId) => {
        Alert.alert("Remove Request", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        await adminAPI.deleteDeletionRequest(requestId);
                        loadDeletionRequests();
                    } catch (error) { Alert.alert("Error", "Failed to remove"); }
                    finally { setLoading(false); }
                }
            }
        ]);
    };

    // Navigation and Layout Helpers
    function getOnBack() {
        const subScreens = {
            "EditProfile": "Profile",
            "Settings": "Profile",
            "NotificationSettings": "Settings",
            "GeneralSettings": "Settings",
            "SecuritySettings": "Settings",
            "PaymentSettings": "Settings",
            "ChangePassword": "Profile",
            "PrivacyPolicy": "Profile",
            "TermsAndConditions": "Profile",
        };
        if (subScreens[activeScreen]) return () => setActiveScreen(subScreens[activeScreen]);
        const dashboardSubScreens = ["Leads", "Revenue", "Categories", "Subcategories"];
        if (dashboardSubScreens.includes(activeScreen)) return () => setActiveScreen("Dashboard");
        return null;
    }

    function handleFABPress() {
        switch (activeScreen) {
            case "Users":
                setEditingUser(null);
                setUserForm({ name: "", email: "", role: "HOMEOWNER", password: "" });
                setShowUserModal(true);
                break;
            case "Categories":
                setEditingCategory(null);
                setCategoryForm({ name: "", description: "" });
                setShowCategoryModal(true);
                break;
            case "Subcategories":
                setEditingSubcategory(null);
                setSubcategoryForm({ name: "", category: "" });
                setShowSubcategoryModal(true);
                break;
            case "Jobs":
                setEditingJob(null);
                setJobForm({ description: "", homeowner: "", category: "", subCategory: "", city: "", postcode: "", budgetMin: "", budgetMax: "", status: "OPEN" });
                setShowJobModal(true);
                break;
            case "Leads":
                setEditingLead(null);
                setLeadForm({ job: "", tradesperson: "", message: "", priceEstimate: "", status: "PENDING", isUnlocked: false });
                setShowLeadModal(true);
                break;
        }
    }

    function shouldShowFAB() {
        return ["Users", "Categories", "Subcategories", "Jobs", "Leads"].includes(activeScreen);
    }

    const renderContent = () => {
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
                return <DashboardScreen stats={stats} onNavigate={setActiveScreen} deletionRequests={deletionRequests} />;
            case "Users":
                return (
                    <UsersScreen
                        users={users}
                        searchQuery={usersSearch}
                        onSearchChange={setUsersSearch}
                        onEdit={(user) => {
                            setEditingUser(user);
                            setUserForm({ name: user.name || "", email: user.email || "", role: user.role || "HOMEOWNER", password: "" });
                            setShowUserModal(true);
                        }}
                        onDelete={handleDeleteUser}
                    />
                );
            case "Categories":
                return (
                    <CategoriesScreen
                        categories={categories}
                        onEdit={(cat) => {
                            setEditingCategory(cat);
                            setCategoryForm({ name: cat.name });
                            setShowCategoryModal(true);
                        }}
                        onDelete={handleDeleteCategory}
                    />
                );
            case "Subcategories":
                return (
                    <SubcategoriesScreen
                        subcategories={subcategories}
                        onEdit={(sub) => {
                            setEditingSubcategory(sub);
                            setSubcategoryForm({ name: sub.name, category: sub.category?._id || sub.category });
                            setShowSubcategoryModal(true);
                        }}
                        onDelete={handleDeleteSubcategory}
                    />
                );
            case "Jobs":
                return (
                    <JobsScreen
                        jobs={jobs}
                        status={jobStatus}
                        onStatusChange={setJobStatus}
                        onEdit={(job) => {
                            setEditingJob(job);
                            setJobForm({
                                description: job.description || "",
                                category: job.category?._id || job.category || "",
                                subCategory: job.subCategory?._id || job.subCategory || "",
                                city: job.location?.city || job.city || "",
                                postcode: job.location?.postcode || job.postcode || "",
                                budgetMin: job.budgetMin?.toString() || "",
                                budgetMax: job.budgetMax?.toString() || "",
                                status: job.status || "OPEN",
                                homeowner: job.homeowner?._id || job.homeowner || "",
                            });
                            setShowJobModal(true);
                        }}
                        onDelete={handleDeleteJob}
                    />
                );
            case "Leads":
                return (
                    <LeadsScreen
                        leads={leads}
                        status={leadStatus}
                        onStatusChange={setLeadStatus}
                        onEdit={(lead) => {
                            setEditingLead(lead);
                            setLeadForm({
                                job: lead.job?._id || lead.job || "",
                                tradesperson: lead.tradesperson?._id || lead.tradesperson || "",
                                message: lead.message || "",
                                priceEstimate: lead.priceEstimate?.toString() || "",
                                status: lead.status || "PENDING",
                                isUnlocked: lead.isUnlocked || false,
                            });
                            setShowLeadModal(true);
                        }}
                        onDelete={handleDeleteLead}
                    />
                );
            case "Revenue":
                return <RevenueScreen revenue={stats.revenue} />;
            case "DeletionRequests":
                return (
                    <DeletionRequestsScreen
                        requests={deletionRequests}
                        onProcess={handleProcessDeletion}
                        onDelete={handleDeleteRequest}
                    />
                );
            case "Verifications":
                return (
                    <VerificationsScreen
                        verifications={verifications}
                        status={verificationStatus}
                        onStatusChange={(s) => { setVerificationStatus(s); loadVerifications(s); }}
                        onReview={(tp) => { setSelectedTradesperson(tp); setShowVerificationModal(true); }}
                    />
                );
            case "Profile": return <AdminProfileScreen onNavigate={setActiveScreen} />;
            case "EditProfile": return <AdminEditProfileScreen onNavigate={setActiveScreen} goBack={() => setActiveScreen("Profile")} />;
            case "Settings": return <SettingsScreen onNavigate={setActiveScreen} />;
            case "NotificationSettings": return <NotificationSettingsScreen onNavigate={setActiveScreen} />;
            case "GeneralSettings": return <GeneralSettingsScreen onNavigate={setActiveScreen} />;
            case "SecuritySettings": return <SecuritySettingsScreen onNavigate={setActiveScreen} />;
            case "PaymentSettings": return <PaymentSettingsScreen onNavigate={setActiveScreen} />;
            case "ChangePassword": return <ChangePasswordScreen navigation={navigation} />;
            case "PrivacyPolicy": return <PrivacyPolicyScreen navigation={navigation} />;
            case "TermsAndConditions": return <TermsAndConditionsScreen navigation={navigation} />;
            default: return null;
        }
    };

    return (
        <AdminLayout
            activeScreen={activeScreen}
            onScreenChange={setActiveScreen}
            showBottomNav={false}
            onBack={getOnBack()}
            onCreatePress={shouldShowFAB() ? handleFABPress : null}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
            }
        >
            {renderContent()}

            <UserFormModal
                visible={showUserModal}
                editing={!!editingUser}
                formData={userForm}
                onFormChange={setUserForm}
                onSave={handleSaveUser}
                onClose={() => setShowUserModal(false)}
            />

            <CategoryFormModal
                visible={showCategoryModal}
                editing={!!editingCategory}
                formData={categoryForm}
                onFormChange={setCategoryForm}
                onSave={handleSaveCategory}
                onClose={() => setShowCategoryModal(false)}
            />

            <SubcategoryFormModal
                visible={showSubcategoryModal}
                editing={!!editingSubcategory}
                formData={subcategoryForm}
                categories={categories}
                onFormChange={setSubcategoryForm}
                onSave={handleSaveSubcategory}
                onClose={() => setShowSubcategoryModal(false)}
            />

            <JobFormModal
                visible={showJobModal}
                editing={!!editingJob}
                formData={jobForm}
                users={users}
                categories={categories}
                subcategories={subcategories}
                onFormChange={setJobForm}
                onSave={handleSaveJob}
                onClose={() => setShowJobModal(false)}
            />

            <LeadFormModal
                visible={showLeadModal}
                editing={!!editingLead}
                formData={leadForm}
                jobs={jobs}
                users={users}
                onFormChange={setLeadForm}
                onSave={handleSaveLead}
                onClose={() => setShowLeadModal(false)}
            />

            <RejectionReasonModal
                visible={showRejectionModal}
                reason={rejectionReason}
                onReasonChange={setRejectionReason}
                onConfirm={() => handleVerifyTradesperson(selectedTradesperson?.id, "REJECTED", rejectionReason)}
                onCancel={() => setShowRejectionModal(false)}
            />

            <VerificationDetailsModal
                visible={showVerificationModal}
                tradesperson={selectedTradesperson}
                onApprove={() => handleVerifyTradesperson(selectedTradesperson?.id, "APPROVED")}
                onReject={() => {
                    setShowVerificationModal(false);
                    setShowRejectionModal(true);
                }}
                onClose={() => setShowVerificationModal(false)}
            />
        </AdminLayout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: wp(4),
        paddingBottom: hp(10),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: hp(10),
    },
    loadingText: {
        marginTop: hp(1.5),
        fontSize: normalize(16),
        color: "#64748B",
    },
});
