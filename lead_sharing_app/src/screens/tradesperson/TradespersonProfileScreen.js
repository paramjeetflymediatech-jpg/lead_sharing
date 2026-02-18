import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tradespersonAPI } from '../../services/api';
import { normalize, wp, hp } from '../../utils/responsive';

export default function TradespersonProfileScreen({ route, navigation }) {
    const { tradespersonId } = route.params;
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [completedJobs, setCompletedJobs] = useState([]);

    useEffect(() => {
        loadProfile();
    }, [tradespersonId]);

    async function loadProfile() {
        try {
            setLoading(true);
            // getPublicProfile returns profile, stats, and reviews all in one call
            const response = await tradespersonAPI.getPublicProfile(tradespersonId);

            if (response && response.data) {
                setProfile(response.data);
                const statsData = response.stats || response.data.stats || {};
                setStats({
                    totalJobs: Number(statsData.totalJobs || response.data.totalJobs || 0),
                    averageRating: Number(statsData.averageRating || response.data.averageRating || 0),
                    totalRatings: Number(statsData.totalRatings || response.data.totalRatings || 0)
                });
                // Reviews are included in the profile data
                setCompletedJobs(response.data.reviews || []);
            } else {
                setStats({ totalJobs: 0, averageRating: 0, totalRatings: 0 });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setStats({ totalJobs: 0, averageRating: 0, totalRatings: 0 });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Profile not found</Text>
            </View>
        );
    }

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<Feather key={i} name="star" size={16} color="#FCD34D" fill="#FCD34D" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<Feather key={i} name="star" size={16} color="#FCD34D" />);
            } else {
                stars.push(<Feather key={i} name="star" size={16} color="#D1D5DB" />);
            }
        }
        return stars;
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileIcon}>
                    <Feather name="user" size={40} color="#2563EB" />
                </View>
                <Text style={styles.name}>{profile.company_name || profile.name || 'Tradesperson'}</Text>
                {profile.category && (
                    <Text style={styles.category}>{profile.category}</Text>
                )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Feather name="briefcase" size={24} color="#2563EB" />
                    <Text style={styles.statValue}>{stats?.totalJobs || 0}</Text>
                    <Text style={styles.statLabel}>Jobs Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Feather name="star" size={24} color="#FCD34D" />
                    <Text style={styles.statValue}>{(stats?.averageRating || 0).toFixed(1)}</Text>
                    <View style={styles.starsRow}>
                        {renderStars(stats?.averageRating || 0)}
                    </View>
                    <Text style={styles.statLabel}>
                        ({stats?.totalRatings || 0} review{stats?.totalRatings !== 1 ? 's' : ''})
                    </Text>
                </View>
            </View>

            {/* Bio/Description */}
            {profile.bio && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.bioText}>{profile.bio}</Text>
                </View>
            )}

            {/* Recent Completed Jobs & Reviews */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Work & Reviews</Text>
                {completedJobs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="inbox" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No completed jobs yet</Text>
                    </View>
                ) : (
                    completedJobs.map((job, index) => (
                        <View key={job.id || index} style={styles.jobCard}>
                            <Text style={styles.jobDescription} numberOfLines={2}>
                                {job.description || 'Job completed'}
                            </Text>
                            <Text style={styles.jobDate}>
                                Completed: {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : 'Recently'}
                            </Text>
                            {job.rating && (
                                <View style={styles.ratingContainer}>
                                    <View style={styles.starsRow}>
                                        {renderStars(job.rating)}
                                    </View>
                                    <Text style={styles.ratingValue}>{job.rating.toFixed(1)}</Text>
                                </View>
                            )}
                            {job.review && (
                                <Text style={styles.reviewText}>"{job.review}"</Text>
                            )}
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: normalize(16),
        color: '#6B7280',
    },
    header: {
        backgroundColor: '#FFFFFF',
        padding: normalize(24),
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    profileIcon: {
        width: normalize(80),
        height: normalize(80),
        borderRadius: normalize(40),
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    name: {
        fontSize: normalize(24),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(0.5),
    },
    category: {
        fontSize: normalize(16),
        color: '#6B7280',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
        gap: wp(4),
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: normalize(16),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statValue: {
        fontSize: normalize(32),
        fontWeight: '700',
        color: '#111827',
        marginTop: hp(1),
    },
    statLabel: {
        fontSize: normalize(12),
        color: '#6B7280',
        textAlign: 'center',
        marginTop: hp(0.5),
    },
    starsRow: {
        flexDirection: 'row',
        gap: normalize(2),
        marginTop: hp(0.5),
    },
    section: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(2),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(1.5),
    },
    bioText: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(20),
        backgroundColor: '#FFFFFF',
        padding: normalize(16),
        borderRadius: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: hp(4),
    },
    emptyText: {
        fontSize: normalize(14),
        color: '#9CA3AF',
        marginTop: hp(1),
    },
    jobCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: normalize(16),
        marginBottom: hp(1.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    jobDescription: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#111827',
        marginBottom: hp(0.5),
    },
    jobDate: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginBottom: hp(1),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(8),
        marginBottom: hp(1),
    },
    ratingValue: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#111827',
    },
    reviewText: {
        fontSize: normalize(14),
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: normalize(20),
        marginTop: hp(0.5),
    },
});
