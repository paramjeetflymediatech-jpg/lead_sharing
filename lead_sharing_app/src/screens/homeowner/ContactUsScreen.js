
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from "../../utils/responsive";

export default function ContactUsScreen({ navigation }) {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const handleSend = () => {
        if (!subject.trim() || !message.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setSending(true);
        // Simulate API call
        setTimeout(() => {
            setSending(false);
            Alert.alert("Success", "Message sent successfully!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        }, 1500);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Contact Us</Text>
                </View>

                <View style={styles.content}>
                    <Text style={styles.description}>
                        Have a question or need assistance? Fill out the form below and our team will get back to you.
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="What is this regarding?"
                            placeholderTextColor="#9CA3AF"
                            value={subject}
                            onChangeText={setSubject}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Message</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Tell us how we can help..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                            value={message}
                            onChangeText={setMessage}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={sending}
                    >
                        {sending ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.sendButtonText}>Send Message</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.contactInfo}>
                        <View style={styles.contactItem}>
                            <Feather name="mail" size={20} color="#6B7280" style={styles.contactIcon} />
                            <Text style={styles.contactText}>support@allcarepros.com</Text>
                        </View>
                        <View style={styles.contactItem}>
                            <Feather name="phone" size={20} color="#6B7280" style={styles.contactIcon} />
                            <Text style={styles.contactText}>1-800-123-4567</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    content: {
        padding: wp(5),
    },
    description: {
        fontSize: normalize(15),
        color: '#4B5563',
        marginBottom: hp(3),
        lineHeight: normalize(22),
    },
    inputGroup: {
        marginBottom: hp(2.5),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: hp(1),
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wp(3),
        padding: wp(3),
        fontSize: normalize(16),
        color: '#1F2937',
    },
    textArea: {
        minHeight: hp(15),
        paddingTop: wp(3),
    },
    sendButton: {
        backgroundColor: '#2563EB',
        borderRadius: wp(3),
        paddingVertical: hp(2),
        alignItems: 'center',
        marginTop: hp(1),
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '700',
    },
    contactInfo: {
        marginTop: hp(5),
        paddingTop: hp(3),
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    contactIcon: {
        marginRight: wp(3),
    },
    contactText: {
        fontSize: normalize(15),
        color: '#6B7280',
    },
});
