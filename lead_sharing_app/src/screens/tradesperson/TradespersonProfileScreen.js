import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
    Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tradespersonAPI } from '../../services/api';
import { normalize, wp, hp } from '../../utils/responsive';

export default function TradespersonProfileScreen({ route, navigation }) {
    const { tradespersonId } = route.params;
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    useEffect(() => {
        loadProfile();
    }, [tradespersonId]);

    async function loadProfile() {
        try {
            setLoading(true);
            const response = await tradespersonAPI.getPublicProfile(tradespersonId);
            console.log('[TradespersonProfile] API response:', JSON.stringify(response, null, 2));

            if (response && response.data) {
                setProfile(response.data);
                const statsData = response.stats || response.data.stats || {};
                setStats({
                    totalJobs: Number(statsData.totalJobs || response.data.totalJobs || response.data.completedJobs || 0),
                    averageRating: Number(statsData.averageRating || response.data.averageRating || 0),
                    totalRatings: Number(statsData.totalRatings || response.data.totalRatings || 0),
                    completionRate: Number(statsData.completionRate || 0),
                });
                setReviews(response.data.reviews || []);

                // Normalize ratingDistribution keys (JSON converts integer keys to strings)
                const rawDist = response.data.ratingDistribution || statsData.ratingBreakdown || {};
                const normalizedDist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                Object.keys(rawDist).forEach(key => {
                    normalizedDist[Number(key)] = Number(rawDist[key]) || 0;
                });
                setRatingDistribution(normalizedDist);

                console.log('[TradespersonProfile] Reviews:', response.data.reviews?.length || 0);
                console.log('[TradespersonProfile] RatingDist:', normalizedDist);
            } else {
                setStats({ totalJobs: 0, averageRating: 0, totalRatings: 0, completionRate: 0 });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            setStats({ totalJobs: 0, averageRating: 0, totalRatings: 0, completionRate: 0 });
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
                <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderStars = (rating, size = normalize(14)) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<Feather key={i} name="star" size={size} color="#F59E0B" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<Feather key={i} name="star" size={size} color="#F59E0B" />);
            } else {
                stars.push(<Feather key={i} name="star" size={size} color="#D1D5DB" />);
            }
        }
        return stars;
    };

    const totalRatingsForBar = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with back button */}
            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={normalize(24)} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerBarTitle}>Tradesperson Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.profileTop}>
                    <View style={styles.avatarContainer}>
                        {profile.profileImage && profile.profileImage !== '/default-avatar.png' ? (
                            <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} />
                        ) : (
                            <Feather name="user" size={normalize(36)} color="#2563EB" />
                        )}
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile.companyName || profile.name || 'Tradesperson'}</Text>
                        {profile.category && (
                            <Text style={styles.profileCategory}>{profile.category}</Text>
                        )}
                        <View style={styles.ratingRow}>
                            <View style={styles.starsRow}>{renderStars(parseFloat(stats?.averageRating || 0))}</View>
                            <Text style={styles.ratingText}>
                                {parseFloat(stats?.averageRating || 0).toFixed(1)}
                            </Text>
                            <Text style={styles.reviewCount}>
                                ({stats?.totalRatings || 0} review{stats?.totalRatings !== 1 ? 's' : ''})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick stats badges */}
                <View style={styles.badgesRow}>
                    <View style={styles.badge}>
                        <Feather name="briefcase" size={normalize(12)} color="#059669" />
                        <Text style={styles.badgeText}>{stats?.totalJobs || 0} jobs completed</Text>
                    </View>
                    <View style={styles.badge}>
                        <Feather name="calendar" size={normalize(12)} color="#059669" />
                        <Text style={styles.badgeText}>Member since {profile.memberSince || 'N/A'}</Text>
                    </View>
                    {profile.verified && (
                        <View style={[styles.badge, styles.verifiedBadge]}>
                            <Feather name="check-circle" size={normalize(12)} color="#2563EB" />
                            <Text style={[styles.badgeText, { color: '#2563EB' }]}>Verified</Text>
                        </View>
                    )}
                </View>

                {/* Response time */}
                {profile.responseTime && (
                    <View style={styles.responseTimeRow}>
                        <Feather name="clock" size={normalize(14)} color="#6B7280" />
                        <Text style={styles.responseTimeText}>Typically responds {profile.responseTime?.toLowerCase()}</Text>
                    </View>
                )}
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.card}>
                    {profile.email && (
                        <View style={styles.contactRow}>
                            <View style={styles.contactIconWrap}>
                                <Feather name="mail" size={normalize(16)} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Email</Text>
                                <Text style={styles.contactValue}>{profile.email}</Text>
                            </View>
                        </View>
                    )}
                    {profile.phone && profile.phone !== 'Not provided' && (
                        <View style={styles.contactRow}>
                            <View style={styles.contactIconWrap}>
                                <Feather name="phone" size={normalize(16)} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Phone</Text>
                                <Text style={styles.contactValue}>{profile.phone}</Text>
                            </View>
                        </View>
                    )}
                    {profile.postcode && profile.postcode !== 'Not specified' && (
                        <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                            <View style={styles.contactIconWrap}>
                                <Feather name="map-pin" size={normalize(16)} color="#2563EB" />
                            </View>
                            <View>
                                <Text style={styles.contactLabel}>Location</Text>
                                <Text style={styles.contactValue}>{profile.postcode}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>

            {/* Skills & Expertise */}
            {profile.skills && profile.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills & Expertise</Text>
                    <View style={styles.chipsContainer}>
                        {profile.skills.map((skill, index) => (
                            <View key={index} style={styles.chip}>
                                <Text style={styles.chipText}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Service Areas */}
            {Array.isArray(profile.serviceAreas) && profile.serviceAreas.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Areas</Text>
                    <View style={styles.chipsContainer}>
                        {profile.serviceAreas.map((area, index) => (
                            <View key={index} style={[styles.chip, styles.chipGreen]}>
                                <Feather name="map-pin" size={normalize(12)} color="#059669" style={{ marginRight: 4 }} />
                                <Text style={[styles.chipText, { color: '#059669' }]}>{area}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* About */}
            {profile.bio && profile.bio !== 'No bio provided' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <View style={styles.card}>
                        <Text style={styles.bioText}>{profile.bio}</Text>
                    </View>
                </View>
            )}

            {/* Rating Breakdown */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rating Breakdown</Text>
                <View style={styles.card}>
                    <View style={styles.ratingOverview}>
                        <View style={styles.ratingBig}>
                            <Text style={styles.ratingBigNumber}>{parseFloat(stats?.averageRating || 0).toFixed(1)}</Text>
                            <View style={styles.starsRow}>{renderStars(parseFloat(stats?.averageRating || 0), normalize(18))}</View>
                            <Text style={styles.ratingBigLabel}>{stats?.totalRatings || 0} reviews</Text>
                        </View>
                        <View style={styles.ratingBars}>
                            {[5, 4, 3, 2, 1].map((star) => (
                                <View key={star} style={styles.ratingBarRow}>
                                    <Text style={styles.ratingBarLabel}>{star}</Text>
                                    <Feather name="star" size={normalize(12)} color="#F59E0B" />
                                    <View style={styles.ratingBarTrack}>
                                        <View
                                            style={[
                                                styles.ratingBarFill,
                                                {
                                                    width: totalRatingsForBar > 0
                                                        ? `${((ratingDistribution[star] || 0) / totalRatingsForBar) * 100}%`
                                                        : '0%'
                                                }
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.ratingBarCount}>{ratingDistribution[star] || 0}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

            {/* Reviews */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                {reviews.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Feather name="message-circle" size={normalize(40)} color="#D1D5DB" />
                        <Text style={styles.emptyText}>No reviews yet</Text>
                    </View>
                ) : (
                    reviews.map((review, index) => (
                        <View key={review.id || index} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerInfo}>
                                    <View style={styles.avatarMini}>
                                        <Text style={styles.avatarMiniText}>
                                            {(review.homeownerName || 'H').charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.reviewerName}>{review.homeownerName || 'Verified Homeowner'}</Text>
                                        <Text style={styles.reviewDate}>{review.date || 'Recently'}</Text>
                                    </View>
                                </View>
                                <View style={styles.starsRow}>{renderStars(review.rating || 5, 14)}</View>
                            </View>

                            {review.jobTitle && (
                                <View style={styles.reviewJobTag}>
                                    <Feather name="briefcase" size={normalize(12)} color="#6B7280" />
                                    <Text style={styles.reviewJobText}>{review.jobTitle}</Text>
                                </View>
                            )}

                            {review.comment && review.comment !== 'No comment provided' && (
                                <Text style={styles.reviewComment}>"{review.comment}"</Text>
                            )}
                        </View>
                    ))
                )}
            </View>

            <View style={{ height: hp(5) }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    errorText: {
        fontSize: normalize(16),
        color: '#6B7280',
        marginBottom: hp(2),
    },
    goBackBtn: {
        backgroundColor: '#2563EB',
        paddingHorizontal: wp(6),
        paddingVertical: hp(1.5),
        borderRadius: wp(3),
    },
    goBackBtnText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: normalize(14),
    },

    // Header bar
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'ios' ? hp(6) : hp(5),
        paddingBottom: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerBarTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#111827',
    },

    // Profile card
    profileCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: wp(4),
        marginTop: hp(2),
        borderRadius: wp(4),
        padding: wp(5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    profileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(2),
    },
    avatarContainer: {
        width: normalize(70),
        height: normalize(70),
        borderRadius: normalize(35),
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: wp(4),
        borderWidth: 2,
        borderColor: '#DBEAFE',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: normalize(35),
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(0.3),
    },
    profileCategory: {
        fontSize: normalize(13),
        color: '#6B7280',
        marginBottom: hp(0.5),
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(4),
    },
    starsRow: {
        flexDirection: 'row',
        gap: normalize(1),
    },
    ratingText: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#111827',
        marginLeft: normalize(4),
    },
    reviewCount: {
        fontSize: normalize(12),
        color: '#6B7280',
    },

    // Badges
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(8),
        marginBottom: hp(1.5),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        borderRadius: normalize(20),
        gap: normalize(4),
        borderWidth: 1,
        borderColor: '#D1FAE5',
    },
    badgeText: {
        fontSize: normalize(11),
        fontWeight: '600',
        color: '#059669',
    },
    verifiedBadge: {
        backgroundColor: '#EFF6FF',
        borderColor: '#DBEAFE',
    },
    responseTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
        paddingTop: hp(1),
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    responseTimeText: {
        fontSize: normalize(13),
        color: '#6B7280',
    },

    // Sections
    section: {
        paddingHorizontal: wp(4),
        marginTop: hp(2.5),
    },
    sectionTitle: {
        fontSize: normalize(16),
        fontWeight: '700',
        color: '#111827',
        marginBottom: hp(1.2),
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
        padding: wp(4),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },

    // Contact info
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: normalize(12),
    },
    contactIconWrap: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(10),
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: normalize(11),
        color: '#9CA3AF',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    contactValue: {
        fontSize: normalize(15),
        color: '#1F2937',
        fontWeight: '500',
        marginTop: normalize(2),
    },

    // Chips
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: normalize(8),
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: normalize(14),
        paddingVertical: normalize(8),
        borderRadius: normalize(20),
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    chipGreen: {
        backgroundColor: '#ECFDF5',
        borderColor: '#D1FAE5',
    },
    chipText: {
        fontSize: normalize(13),
        color: '#2563EB',
        fontWeight: '600',
    },

    // Bio
    bioText: {
        fontSize: normalize(14),
        color: '#4B5563',
        lineHeight: normalize(22),
    },

    // Rating breakdown
    ratingOverview: {
        flexDirection: 'row',
        gap: wp(5),
    },
    ratingBig: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: wp(20),
    },
    ratingBigNumber: {
        fontSize: normalize(36),
        fontWeight: '800',
        color: '#111827',
    },
    ratingBigLabel: {
        fontSize: normalize(12),
        color: '#6B7280',
        marginTop: hp(0.5),
    },
    ratingBars: {
        flex: 1,
        gap: normalize(6),
        justifyContent: 'center',
    },
    ratingBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
    },
    ratingBarLabel: {
        fontSize: normalize(12),
        fontWeight: '600',
        color: '#6B7280',
        width: normalize(12),
        textAlign: 'center',
    },
    ratingBarTrack: {
        flex: 1,
        height: normalize(8),
        backgroundColor: '#F3F4F6',
        borderRadius: normalize(4),
        overflow: 'hidden',
    },
    ratingBarFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: normalize(4),
    },
    ratingBarCount: {
        fontSize: normalize(12),
        color: '#9CA3AF',
        width: normalize(20),
        textAlign: 'right',
    },

    // Reviews
    reviewCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(1.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hp(1),
    },
    reviewerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(10),
        flex: 1,
    },
    avatarMini: {
        width: normalize(36),
        height: normalize(36),
        borderRadius: normalize(18),
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarMiniText: {
        fontSize: normalize(15),
        fontWeight: '700',
        color: '#2563EB',
    },
    reviewerName: {
        fontSize: normalize(14),
        fontWeight: '700',
        color: '#111827',
    },
    reviewDate: {
        fontSize: normalize(12),
        color: '#9CA3AF',
        marginTop: normalize(1),
    },
    reviewJobTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: normalize(6),
        backgroundColor: '#F9FAFB',
        paddingHorizontal: normalize(10),
        paddingVertical: normalize(5),
        borderRadius: normalize(8),
        marginBottom: hp(1),
        alignSelf: 'flex-start',
    },
    reviewJobText: {
        fontSize: normalize(12),
        color: '#6B7280',
        fontWeight: '500',
    },
    reviewComment: {
        fontSize: normalize(14),
        color: '#4B5563',
        fontStyle: 'italic',
        lineHeight: normalize(22),
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingVertical: hp(4),
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
    },
    emptyText: {
        fontSize: normalize(14),
        color: '#9CA3AF',
        marginTop: hp(1),
    },
});
