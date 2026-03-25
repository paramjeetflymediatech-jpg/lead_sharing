import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { normalize, hp, wp } from "../utils/responsive";

const PrivacyPolicyScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ArrowLeft color="#333" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>

            <ScrollView style={styles.contentAndPadding} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>1. Introduction</Text>
                <Text style={styles.text}>
                    At All Care Pros, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and our website.
                </Text>

                <Text style={styles.sectionTitle}>2. Information Collection</Text>
                <Text style={styles.text}>
                    We collect information that you provide directly to us when you create an account, such as your name, email address, phone number, and professional details (for tradespeople).
                </Text>

                <Text style={styles.sectionTitle}>3. Device Permissions</Text>
                <Text style={styles.text}>
                    To provide our services, we request specific permissions:
                    {"\n"}• <Text style={{fontWeight: 'bold'}}>Camera:</Text> To allow you to take and upload profile pictures, project photos, and verification documents. We only access the camera when you explicitly initiate a photo-taking action.
                    {"\n"}• <Text style={{fontWeight: 'bold'}}>Gallery/Storage:</Text> To select and upload existing photos from your device.
                    {"\n"}• <Text style={{fontWeight: 'bold'}}>Notifications:</Text> To send you updates about your jobs, leads, and messages.
                </Text>

                <Text style={styles.sectionTitle}>4. Data Safety</Text>
                <Text style={styles.text}>
                    We do not sell your personal data to third parties. We only collect data necessary for the app to function (Account Info, Photos you upload, and basic device info for security). We do not record audio or track your location in the background.
                </Text>

                <Text style={styles.sectionTitle}>5. Payment Integration</Text>
                <Text style={styles.text}>
                    We use Stripe, a third-party payment processor, to handle credit purchases and transactions. We do not store your credit card or sensitive financial information on our servers. All transactions are processed securely through Stripe's encrypted platform.
                </Text>

                <Text style={styles.sectionTitle}>6. Use of Information</Text>
                <Text style={styles.text}>
                    We use the information we collect to provide, maintain, and improve our services, to facilitate connections between homeowners and care professionals, and to send you technical notices and support messages.
                </Text>

                <Text style={styles.sectionTitle}>7. Data Sharing</Text>
                <Text style={styles.text}>
                    We share information between homeowners and tradespeople only to the extent necessary to facilitate the service requests. We do not sell your personal data to third parties.
                </Text>

                <Text style={styles.sectionTitle}>8. Data Security</Text>
                <Text style={styles.text}>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide, please be aware that no security measures are perfect.
                </Text>

                <Text style={styles.sectionTitle}>9. Account Deletion</Text>
                <Text style={styles.text}>
                    You have the right to request the deletion of your account and associated data. You can do this through the "Privacy & Security" section in the app settings or by contacting our support team.
                </Text>

                <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
                <Text style={styles.text}>
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                </Text>

                <Text style={styles.sectionTitle}>11. Contact Us</Text>
                <Text style={styles.text}>
                    If you have any questions about this Privacy Policy, please contact us at gurmukhdhatt505@gmail.com.
                </Text>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last Updated: March 2026</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : hp(5),
    },
    backButton: {
        padding: wp(2),
        marginRight: wp(2),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: 'bold',
        color: '#333',
    },
    contentAndPadding: {
        flex: 1,
    },
    scrollContent: {
        padding: wp(5),
        paddingBottom: hp(5),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: hp(2.5),
        marginBottom: hp(1.2),
    },
    text: {
        fontSize: normalize(16),
        color: '#555',
        lineHeight: normalize(24),
        textAlign: 'justify',
    },
    footer: {
        marginTop: hp(4),
        paddingTop: hp(2.5),
        borderTopWidth: 1,
        borderTopColor: '#eee',
        alignItems: 'center'
    },
    footerText: {
        color: '#999',
        fontSize: normalize(14)
    }
});

export default PrivacyPolicyScreen;
