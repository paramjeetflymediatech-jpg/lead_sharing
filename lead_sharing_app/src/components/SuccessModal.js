import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { normalize, hp, wp } from '../utils/responsive';

const SuccessModal = ({ visible, onClose, title, message, buttonText }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <Check color="#FFFFFF" size={normalize(40)} strokeWidth={3} />
                    </View>

                    <Text style={styles.title}>{title || "Success!"}</Text>

                    <Text style={styles.message}>
                        {message || "Operation completed successfully."}
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onClose}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>{buttonText || "Continue"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wp(6),
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: wp(6),
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        width: wp(20),
        height: wp(20),
        backgroundColor: '#10B981', // Emerald 500
        borderRadius: wp(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hp(2.5),
        marginTop: -hp(5), // Pull icon up
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    title: {
        fontSize: normalize(22),
        fontWeight: 'bold',
        color: '#1F2937', // Gray 800
        marginBottom: hp(1),
        textAlign: 'center',
    },
    message: {
        fontSize: normalize(15),
        color: '#6B7280', // Gray 500
        textAlign: 'center',
        marginBottom: hp(3),
        lineHeight: normalize(22),
    },
    button: {
        backgroundColor: '#2563EB', // Blue 600
        width: '100%',
        paddingVertical: hp(1.8),
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: normalize(16),
        fontWeight: '600',
    },
});

export default SuccessModal;
