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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AdminLayout from "../components/admin/AdminLayout";
import { adminAPI } from "../services/api";
import { Feather } from "@expo/vector-icons";

export default function AdminDashboard({ navigation }) {
    const [activeScreen, setActiveScreen] = useState("Dashboard");
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

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);

    // Edit states
    const [editingUser, setEditingUser] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [editingSubcategory, setEditingSubcategory] = useState(null);

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
                    await loadSubcategories();
                    break;
                case "Jobs":
                    await loadJobs();
                    break;
                case "Leads":
                    await loadLeads();
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
            const data = await adminAPI.getUsers();
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
                            await adminAPI.deleteUser(user._id);
                            Alert.alert("Success", "User deleted successfully");
                            await loadUsers();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete user");
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
                            await adminAPI.deleteCategory(category._id);
                            Alert.alert("Success", "Category deleted successfully");
                            await loadCategories();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete category");
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
                            await adminAPI.deleteSubcategory(subcategory._id);
                            Alert.alert("Success", "Subcategory deleted successfully");
                            await loadSubcategories();
                        } catch (error) {
                            Alert.alert("Error", error.message || "Failed to delete subcategory");
                        }
                    },
                },
            ]
        );
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }

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
            default:
                break;
        }
    }

    function shouldShowFAB() {
        return ["Users", "Categories", "Subcategories"].includes(activeScreen);
    }

    async function onRefresh() {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
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
                return <DashboardScreen stats={stats} />;
            case "Users":
                return (
                    <UsersScreen
                        users={users}
                        searchQuery={usersSearch}
                        onSearchChange={setUsersSearch}
                        onEdit={openEditUserModal}
                        onDelete={handleDeleteUser}
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
                        onEdit={openEditSubcategoryModal}
                        onDelete={handleDeleteSubcategory}
                    />
                );
            case "Jobs":
                return <JobsScreen jobs={jobs} />;
            case "Leads":
                return <LeadsScreen leads={leads} />;
            case "Revenue":
                return <RevenueScreen revenue={stats.revenue} />;
            case "SEO Management":
                return <SEOScreen />;
            case "Settings":
                return <SettingsScreen />;
            default:
                return <DashboardScreen stats={stats} />;
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
        </AdminLayout>
    );
}

// ============================================
// DASHBOARD SCREEN
// ============================================
function DashboardScreen({ stats }) {
    return (
        <>
            <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>Admin</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statsRow}>
                    <StatCard
                        title="Users"
                        value={stats.totalUsers}
                        subtitle={`${stats.totalHomeowners} HO • ${stats.totalTradespeople} TP`}
                        icon="users"
                        color="#2563EB"
                    />
                    <StatCard
                        title="Jobs"
                        value={stats.totalJobs}
                        subtitle="Total posted"
                        icon="briefcase"
                        color="#10B981"
                    />
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        title="Leads"
                        value={stats.totalLeads}
                        subtitle="Unlocked"
                        icon="file-text"
                        color="#F59E0B"
                    />
                    <StatCard
                        title="Revenue"
                        value={`$${stats.revenue}`}
                        subtitle="Platform"
                        icon="dollar-sign"
                        color="#8B5CF6"
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
                                <Text style={styles.userAvatarText}>
                                    {user.name?.charAt(0) || "U"}
                                </Text>
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
function JobsScreen({ jobs }) {
    return (
        <>
            <Text style={styles.screenTitle}>Total Jobs: {jobs.length}</Text>

            {jobs.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="briefcase" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No jobs found</Text>
                </View>
            ) : (
                jobs.map((job, index) => (
                    <View key={job._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="briefcase" size={24} color="#64748B" style={styles.categoryIconStyle} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {job.description || job.title || "Job"}
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    Status: {job.status || "OPEN"} | Posted:{" "}
                                    {job.created_at
                                        ? new Date(job.created_at).toLocaleDateString()
                                        : "N/A"}
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor:
                                            job.status === "COMPLETED"
                                                ? "#10B981"
                                                : job.status === "IN_PROGRESS"
                                                    ? "#F59E0B"
                                                    : "#2563EB",
                                    },
                                ]}
                            >
                                <Text style={styles.statusBadgeText}>
                                    {job.status || "OPEN"}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))
            )}
        </>
    );
}

// ============================================
// LEADS SCREEN
// ============================================
function LeadsScreen({ leads }) {
    return (
        <>
            <Text style={styles.screenTitle}>Total Leads: {leads.length}</Text>

            {leads.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="file-text" size={48} color="#D1D5DB" style={styles.emptyIconStyle} />
                    <Text style={styles.emptyText}>No leads found</Text>
                </View>
            ) : (
                leads.map((lead, index) => (
                    <View key={lead._id || index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Feather name="file-text" size={24} color="#64748B" style={styles.categoryIconStyle} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>
                                    Lead #{lead._id ? String(lead._id).slice(-6) : index + 1}
                                </Text>
                                <Text style={styles.cardSubtitle}>
                                    {lead.isUnlocked ? "Unlocked" : "Locked"} | Job:{" "}
                                    {lead.job?.description ? String(lead.job.description).slice(0, 30) : "N/A"}
                                </Text>
                            </View>
                            {lead.isUnlocked && (
                                <Feather name="unlock" size={20} color="#10B981" />
                            )}
                        </View>
                    </View>
                ))
            )}
        </>
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
// SEO SCREEN
// ============================================
function SEOScreen() {
    return (
        <>
            <Text style={styles.screenTitle}>SEO Management</Text>
            <View style={styles.infoCard}>
                <Feather name="search" size={48} color="#2563EB" style={styles.infoIconStyle} />
                <Text style={styles.infoTitle}>SEO Settings</Text>
                <Text style={styles.infoText}>
                    Manage meta tags, descriptions, and search engine optimization settings for your platform.
                </Text>
            </View>
        </>
    );
}

// ============================================
// SETTINGS SCREEN
// ============================================
function SettingsScreen() {
    return (
        <>
            <Text style={styles.screenTitle}>Platform Settings</Text>

            <TouchableOpacity style={styles.settingItem}>
                <Feather name="bell" size={24} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Notifications</Text>
                    <Text style={styles.settingSubtitle}>Manage notification preferences</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
                <Feather name="globe" size={24} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>General Settings</Text>
                    <Text style={styles.settingSubtitle}>Platform configuration</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
                <Feather name="lock" size={24} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Security</Text>
                    <Text style={styles.settingSubtitle}>Privacy and security settings</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
                <Feather name="credit-card" size={24} color="#2563EB" style={styles.settingIconStyle} />
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>Payment Settings</Text>
                    <Text style={styles.settingSubtitle}>Configure payment options</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" />
            </TouchableOpacity>
        </>
    );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ title, value, subtitle, icon, color }) {
    return (
        <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: `${color}08` }]}>
            <Feather name={icon} size={24} color={color} style={styles.statIconStyle} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </View>
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
        fontSize: 24,
        fontWeight: "700",
        color: "#1E293B",
        marginTop: 4,
    },
    statsGrid: {
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
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
        fontSize: 22,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 4,
    },
    statTitle: {
        fontSize: 12,
        color: "#64748B",
        fontWeight: "600",
    },
    statSubtitle: {
        fontSize: 10,
        color: "#94A3B8",
        marginTop: 2,
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
        fontSize: 16,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 16,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
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
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
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
        fontSize: 16,
        color: "#1E293B",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#64748B",
    },
    userAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
    },
    userAvatarText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    categoryIconStyles: {
        marginRight: 4,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    unlockIcon: {
        marginLeft: 8,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 60,
    },
    emptyIconStyle: {
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: "#94A3B8",
    },
    revenueCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    revenueIconStyle: {
        marginBottom: 16,
    },
    revenueAmount: {
        fontSize: 40,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 8,
    },
    revenueLabel: {
        fontSize: 14,
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    settingIconStyle: {
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1E293B",
        marginBottom: 4,
    },
    settingSubtitle: {
        fontSize: 13,
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
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#EFF6FF",
    },
    actionButtonText: {
        fontSize: 13,
        color: "#2563EB",
        fontWeight: "600",
    },
    deleteButton: {
        backgroundColor: "#FEE2E2",
    },
    deleteButtonText: {
        fontSize: 13,
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
        borderRadius: 16,
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
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1E293B",
    },
    modalClose: {
        fontSize: 28,
        color: "#64748B",
        fontWeight: "300",
    },
    modalBody: {
        padding: 20,
        maxHeight: 400,
    },
    modalFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 8,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    picker: {
        height: 50,
        color: "#1E293B",
    },
    cancelButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#F1F5F9",
    },
    cancelButtonText: {
        fontSize: 16,
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
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#2563EB",
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
