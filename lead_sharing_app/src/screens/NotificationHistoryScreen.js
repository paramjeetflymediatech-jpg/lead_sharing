
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../utils/responsive";
import { apiCall } from '../services/api';
import { useAuth } from "../context/AuthContext";
import moment from 'moment';

export default function NotificationHistoryScreen({ navigation }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiCall('/api/notifications');
            if (response.success) {
                setNotifications(response.notifications);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // useEffect(() => {
    //     // fetchNotifications();
    // }, []);

    const onRefresh = () => {
        setRefreshing(true);
        // fetchNotifications();
    };

    const markAsRead = async (id = null) => {
        try {
            const body = id ? { ids: [id] } : {};
            const response = await apiCall('/api/notifications', {
                method: 'PATCH',
                body: JSON.stringify(body)
            });

            if (response.success) {
                if (id) {
                    setNotifications(prev =>
                        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
                    );
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
                }
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleNotificationPress = (item) => {
        markAsRead(item.id);

        // If user is not logged in, do nothing
        if (!user) return;

        // Navigate based on type
        const data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
        const dashboardName = user?.role === 'TRADESPERSON' ? 'TradespersonDashboard' : 'HomeownerDashboard';

        try {
            if (item.type === 'MESSAGE' && data.conversationId) {
                navigation.navigate(dashboardName, {
                    screen: 'Messages',
                    params: {
                        conversationId: data.conversationId
                    }
                });
            } else if (item.type === 'VERIFICATION_PENDING') {
                navigation.navigate('AdminDashboard', { screen: 'Verifications' });
            } else if (data.jobId) {
                navigation.navigate(dashboardName, {
                    screen: 'Home',
                    params: {
                        screen: 'JobDetails',
                        params: { jobId: data.jobId }
                    }
                });
            }
        } catch (e) {
            // If navigation fails (e.g. after logout), just go back
            if (navigation.canGoBack()) {
                navigation.goBack();
            }
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={styles.iconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: getIconBackground(item.type) }]}>
                    <Feather name={getIconName(item.type)} size={normalize(20)} color="#FFFFFF" />
                </View>
                {!item.is_read && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                    <Text style={styles.time}>{moment(item.created_at).fromNow()}</Text>
                </View>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
            </View>
        </TouchableOpacity>
    );

    const getIconName = (type) => {
        switch (type) {
            case 'MESSAGE': return 'message-square';
            case 'LEAD_UNLOCKED': return 'unlock';
            case 'JOB_HIRED': return 'award';
            case 'VERIFICATION_UPDATE': return 'check-shield';
            default: return 'bell';
        }
    };

    const getIconBackground = (type) => {
        switch (type) {
            case 'MESSAGE': return '#3B82F6';
            case 'LEAD_UNLOCKED': return '#10B981';
            case 'JOB_HIRED': return '#F59E0B';
            case 'VERIFICATION_UPDATE': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            navigation.goBack();
                        }
                        // Do NOT navigate to dashboard manually — after logout,
                        // the auth context will automatically switch to auth screens.
                    }}
                    style={styles.backButton}
                >
                    <Feather name="arrow-left" size={normalize(24)} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => markAsRead()} style={styles.markAllButton}>
                    <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#1149C7" />
                </View>
            ) : notifications.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Feather name="bell-off" size={normalize(48)} color="#D1D5DB" />
                    <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(4),
        paddingBottom: hp(2),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        marginTop: hp(3),
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: wp(3),
    },
    headerTitle: {
        flex: 1,
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#111827',
    },
    markAllButton: {
        paddingVertical: hp(0.5),
    },
    markAllText: {
        fontSize: normalize(13),
        color: '#2563EB',
        fontWeight: '500',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(10),
    },
    emptyText: {
        marginTop: hp(2),
        fontSize: normalize(16),
        color: '#9CA3AF',
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: hp(1),
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    unreadItem: {
        backgroundColor: '#EFF6FF',
    },
    iconContainer: {
        position: 'relative',
        marginRight: wp(4),
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#EF4444',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    contentContainer: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(0.5),
    },
    title: {
        flex: 1,
        fontSize: normalize(15),
        fontWeight: '500',
        color: '#374151',
        marginRight: wp(2),
    },
    unreadTitle: {
        fontWeight: '700',
        color: '#111827',
    },
    time: {
        fontSize: normalize(12),
        color: '#9CA3AF',
    },
    body: {
        fontSize: normalize(14),
        color: '#6B7280',
        lineHeight: 20,
    },
});
