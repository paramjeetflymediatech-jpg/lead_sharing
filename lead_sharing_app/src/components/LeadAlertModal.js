import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated
} from 'react-native';

const { width } = Dimensions.get('window');

/**
 * A premium-styled alert popup for new leads.
 * 
 * Props:
 * - visible: boolean
 * - onClose: function
 * - onViewLead: function
 * - lead: object { title, location, budget, distance, timeAgo }
 */
export default function LeadAlertModal({ visible, onClose, onViewLead, lead }) {
    const [animation] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.spring(animation, {
                toValue: 1,
                useNativeDriver: true,
                tension: 65,
                friction: 11
            }).start();
        } else {
            Animated.timing(animation, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    const scale = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1]
    });

    const opacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale }], opacity }
                    ]}
                >
                    {/* Header with Icon */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconText}>🔔</Text>
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.title}>New Lead Alert!</Text>
                            <Text style={styles.subtitle}>A new job matches your skills</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Lead Details Card */}
                    <View style={styles.card}>
                        <View style={styles.row}>
                            <Text style={styles.jobTitle}>{lead?.title || "Plumbing Repair Needed"}</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>NEW</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>📍</Text>
                            <Text style={styles.detailText}>{lead?.location || "Downtown, Toronto"}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailIcon}>💰</Text>
                            <Text style={styles.detailText}>{lead?.budget || "Budget: $200 - $500"}</Text>
                        </View>

                        <View style={styles.metaRow}>
                            <Text style={styles.metaText}>{lead?.distance || "2.5 km away"}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.metaText}>{lead?.timeAgo || "Just now"}</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={onClose}
                        >
                            <Text style={styles.secondaryButtonText}>Ignore</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={onViewLead}
                        >
                            <Text style={styles.primaryButtonText}>View Details</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width - 40,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#EFF6FF', // blue-50
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconText: {
        fontSize: 24,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 18,
        color: '#9CA3AF',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#F9FAFB', // gray-50
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        marginRight: 8,
    },
    badge: {
        backgroundColor: '#DEF7EC', // green-100
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: '#03543F', // green-800
        fontSize: 10,
        fontWeight: '800',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailIcon: {
        fontSize: 14,
        marginRight: 8,
        width: 20,
        textAlign: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#4B5563',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
    dot: {
        marginHorizontal: 8,
        color: '#D1D5DB',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#F3F4F6', // gray-100
        alignItems: 'center',
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4B5563',
    },
    primaryButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#2563EB', // blue-600
        alignItems: 'center',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
