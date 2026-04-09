import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AlertModal from './AlertModal';
import { normalize, hp, wp } from '../utils/responsive';
const { width } = Dimensions.get('window');

export default function UnlockLeadModal({
    visible,
    onClose,
    onUnlock,
    cost = 1,
    loading = false
}) {
    const [scale] = useState(new Animated.Value(0));
    const [opacity] = useState(new Animated.Value(0));
    const [message, setMessage] = useState('');
    const [priceEstimate, setPriceEstimate] = useState('');
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 90
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            setMessage('');
            setPriceEstimate('');
            setAlertVisible(false);
            scale.setValue(0);
            opacity.setValue(0);
        }
    }, [visible]);

    const handleUnlock = () => {
        if (!message.trim() || !priceEstimate.trim()) {
            setAlertMessage("Please provide a price estimate and a short message.");
            setAlertVisible(true);
            return;
        }

        const numericPrice = parseFloat(priceEstimate.replace(/[^0-9.]/g, ''));
        if (isNaN(numericPrice) || numericPrice > 99999999.99) {
            setAlertMessage("Price estimate is too high. Please enter a valid amount.");
            setAlertVisible(true);
            return;
        }

        onUnlock({ message, priceEstimate });
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <Animated.View
                    style={[
                        styles.container,
                        { transform: [{ scale }], opacity }
                    ]}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.iconContainer}>
                            <Feather name="unlock" size={32} color="#2563EB" />
                        </View>

                        <Text style={styles.title}>Unlock Lead & Submit Quote</Text>
                        <Text style={styles.subtitle}>
                            Use <Text style={styles.highlight}>{cost} credit</Text> to unlock this lead and contact the homeowner.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Price Estimate ($)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. 150 - 200"
                                placeholderTextColor="#9CA3AF"
                                value={priceEstimate}
                                onChangeText={setPriceEstimate}
                                keyboardType="numeric"
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Message to Homeowner</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Hi, I can help with your job..."
                                placeholderTextColor="#9CA3AF"
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={onClose}
                                disabled={loading}
                            >
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmButton}
                                onPress={handleUnlock}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <>
                                        <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.confirmText}>Unlock ({cost})</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>

            <AlertModal
                visible={alertVisible}
                onClose={() => setAlertVisible(false)}
                title="Input Required"
                message={alertMessage}
                type="warning"
            />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    scrollContent: {
        padding: 24,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: normalize(22),
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: normalize(20),
    },
    highlight: {
        color: '#2563EB',
        fontWeight: '700',
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16,
    },
    label: {
        fontSize: normalize(13),
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: normalize(14),
        color: '#1F2937',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: normalize(15),
        fontWeight: '600',
        color: '#4B5563',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    confirmText: {
        fontSize: normalize(15),
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
