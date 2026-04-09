import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { normalize, hp, wp } from '../utils/responsive';

const Section = ({ number, title, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
            <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{number}</Text>
            </View>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionText}>{children}</Text>
    </View>
);

const TermsAndConditionsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation?.goBack()}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms & Conditions</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Banner */}
                <View style={styles.heroBanner}>
                    <Text style={styles.heroEmoji}>📋</Text>
                    <Text style={styles.heroTitle}>Our Terms of Service</Text>
                    <Text style={styles.heroSubtitle}>
                        Please read these terms carefully before using All Care Pros.
                    </Text>
                </View>

                {/* Sections */}
                <Section number="1" title="Introduction">
                    Welcome to All Care Pros. By downloading, accessing, or using our mobile
                    application, you agree to be bound by these Terms and Conditions. If you
                    do not agree with any part of these terms, you must not use our App.
                </Section>

                <Section number="2" title="User Accounts">
                    To use certain features of the App, you may be required to create an
                    account. You are responsible for maintaining the confidentiality of your
                    account credentials and for all activities that occur under your account.
                    You agree to notify us immediately of any unauthorised use of your account.
                </Section>

                <Section number="3" title="About All Care Pros">
                    All Care Pros is a platform that connects homeowners with tradespeople to
                    provide home services. We act solely as an intermediary and do not guarantee
                    the quality, safety, or conversion of any leads or services provided through
                    the platform. All service agreements are solely between the homeowner and
                    the tradesperson.
                </Section>

                <Section number="4" title="User Responsibilities">
                    You agree to use the App only for lawful purposes and in a manner that does
                    not infringe the rights of others. You must not use the App to transmit
                    spam, malicious code, or any content that is unlawful, harmful, or
                    offensive. You are solely responsible for any content you post or share.
                </Section>

                <Section number="5" title="Intellectual Property">
                    All content, trademarks, logos, and intellectual property on the App are
                    owned by or licensed to All Care Pros. You may not reproduce, distribute,
                    or create derivative works from any part of the App without our prior
                    written consent.
                </Section>

                <Section number="6" title="Privacy Policy">
                    Your use of the App is also governed by our Privacy Policy, which is
                    incorporated into these Terms by reference. By using the App, you consent
                    to the collection and use of your information as described in our Privacy
                    Policy.
                </Section>

                <Section number="7" title="Limitation of Liability">
                    To the fullest extent permitted by law, All Care Pros shall not be liable
                    for any indirect, incidental, special, consequential, or punitive damages
                    arising from your access to or use of the App, including loss of data,
                    revenue, or profits, even if we have been advised of the possibility of
                    such damages.
                </Section>

                <Section number="8" title="Changes to Terms">
                    We reserve the right to modify these Terms at any time. We will notify
                    you of significant changes via the App or by email. Your continued use
                    of the App following any changes constitutes your acceptance of the revised
                    Terms.
                </Section>

                <Section number="9" title="Governing Law">
                    These Terms shall be governed by and construed in accordance with the laws
                    of the jurisdiction in which All Care Pros operates, without regard to its
                    conflict of law provisions.
                </Section>

                <Section number="10" title="Contact Us">
                    If you have any questions, concerns, or feedback regarding these Terms,
                    please contact us at:{'\n\n'}
                    📧  support@allcarepros.com{'\n'}
                    🌐  www.allcarepros.com
                </Section>

                <Section number="11" title="Account Deletion and Data Retention">
                    You may request to delete your account at any time through the App's Privacy & Security settings. Upon requesting deletion, your account will enter a 24-hour pending period in which you can cancel the request. After this period, your personal data will be anonymized or permanently deleted. However, we reserve the right to retain certain non-personal data or specific records as necessary to investigate fraud, comply with legal obligations, or resolve disputes, in accordance with applicable laws.
                </Section>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerDivider} />
                    <Text style={styles.footerText}>Last Updated: February 2026</Text>
                    <Text style={styles.footerSub}>© 2026 All Care Pros. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: normalize(17),
        fontWeight: '700',
        color: '#1F2937',
    },
    headerSpacer: {
        width: 40,
    },

    /* ── Scroll ── */
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: hp(5),
    },

    /* ── Hero ── */
    heroBanner: {
        backgroundColor: '#EFF6FF',
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        marginBottom: hp(1),
        borderRadius: 16,
        padding: wp(5),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    heroEmoji: {
        fontSize: 36,
        marginBottom: hp(1),
    },
    heroTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#1E40AF',
        marginBottom: hp(0.8),
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: normalize(13),
        color: '#3B82F6',
        textAlign: 'center',
        lineHeight: normalize(20),
    },

    /* ── Section ── */
    section: {
        marginHorizontal: wp(5),
        marginTop: hp(2.5),
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        padding: wp(4),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.2),
        gap: 10,
    },
    sectionBadge: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionBadgeText: {
        color: '#FFFFFF',
        fontSize: normalize(12),
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: normalize(15),
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
    },
    sectionText: {
        fontSize: normalize(13.5),
        color: '#4B5563',
        lineHeight: normalize(22),
        textAlign: 'justify',
    },

    /* ── Footer ── */
    footer: {
        marginTop: hp(4),
        marginHorizontal: wp(5),
        alignItems: 'center',
        paddingBottom: hp(2),
    },
    footerDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E7EB',
        marginBottom: hp(2),
    },
    footerText: {
        fontSize: normalize(13),
        color: '#313232ff',
        fontWeight: '500',
        marginBottom: hp(0.5),
    },
    footerSub: {
        fontSize: normalize(12),
        color: '#313232ff',
    },
});

export default TermsAndConditionsScreen;
