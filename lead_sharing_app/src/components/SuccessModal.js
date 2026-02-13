import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function SuccessModal({ visible, onClose, title, subtitle, buttonText = "OK" }) {
    const [animation] = useState(new Animated.Value(0));

    useEffect(() => {
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
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Feather name="check-circle" size={32} color="#059669" />
                        </View>
                        <Text style={styles.title}>{title || "Success"}</Text>
                        <Text style={styles.subtitle}>{subtitle || "Operation completed successfully"}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={onClose}
                        >
                            <Text style={styles.successButtonText}>{buttonText}</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    container: {
        width: width - 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#D1FAE5', // Green-100
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    actions: {
        width: '100%',
    },
    successButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: '#10B981', // Green-500
        alignItems: 'center',
    },
    successButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
