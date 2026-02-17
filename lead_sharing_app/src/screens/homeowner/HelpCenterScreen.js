
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../../utils/responsive";

export default function HelpCenterScreen({ navigation }) {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            id: 1,
            question: "How do I post a job?",
            answer: "Go to the Home or Jobs tab and click on the 'Post a Job' button. Fill in the details about your project and submit."
        },
        {
            id: 2,
            question: "Is it free to use?",
            answer: "Yes, posting jobs and receiving quotes from tradespeople is completely free for homeowners."
        },
        {
            id: 3,
            question: "How do I contact a tradesperson?",
            answer: "Once a tradesperson unlocks your lead, you will receive their contact details and can message them directly through the app."
        },
    ];

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help Center</Text>
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for help..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                {faqs.map((faq) => (
                    <View key={faq.id} style={styles.faqItem}>
                        <Text style={styles.question}>{faq.question}</Text>
                        <Text style={styles.answer}>{faq.answer}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(7),
        paddingBottom: hp(2),
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: wp(4),
        padding: wp(1),
    },
    headerTitle: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
    },
    searchContainer: {
        padding: wp(5),
        backgroundColor: '#FFFFFF',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: wp(3),
        paddingHorizontal: wp(3),
        height: hp(6),
    },
    searchIcon: {
        marginRight: wp(3),
    },
    searchInput: {
        flex: 1,
        fontSize: normalize(16),
        color: '#1F2937',
    },
    section: {
        padding: wp(5),
    },
    sectionTitle: {
        fontSize: normalize(18),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: hp(2),
    },
    faqItem: {
        backgroundColor: '#FFFFFF',
        borderRadius: wp(3),
        padding: wp(4),
        marginBottom: hp(2),
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    question: {
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: hp(1),
    },
    answer: {
        fontSize: normalize(14),
        color: '#6B7280',
        lineHeight: normalize(20),
    },
});
