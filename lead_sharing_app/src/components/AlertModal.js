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
import { normalize } from '../utils/responsive';

const { width } = Dimensions.get('window');

/**
 * A generic premium-styled alert modal.
 * 
 * Props:
 * - visible: boolean
 * - onClose: function
 * - title: string
 * - message: string
 * - type: 'info' | 'warning' | 'error' | 'success'
 * - buttonText: string
 */
export default function AlertModal({
    visible,
    onClose,
    title,
    message,
    type = 'info',
    buttonText = "OK"
}) {
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

    const getColors = () => {
        switch (type) {
            case 'error':
                return {
                    bg: '#FEE2E2',
                    icon: '#EF4444',
                    button: '#EF4444',
                    iconName: 'alert-circle'
                };
            case 'warning':
                return {
                    bg: '#FFEDD5',
                    icon: '#F59E0B',
                    button: '#F59E0B',
                    iconName: 'alert-triangle'
                };
            case 'success':
                return {
                    bg: '#D1FAE5',
                    icon: '#10B981',
                    button: '#10B981',
                    iconName: 'check-circle'
                };
            default: // info
                return {
                    bg: '#EFF6FF',
                    icon: '#3B82F6',
                    button: '#3B82F6',
                    iconName: 'info'
                };
        }
    };

    const colors = getColors();

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
                        <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
                            <Feather name={colors.iconName} size={normalize(32)} color={colors.icon} />
                        </View>
                        <Text style={styles.title}>{title || (type.charAt(0)?.toUpperCase() + type.slice(1))}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.button }]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>{buttonText}</Text>
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
        width: width - 80,
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
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    actions: {
        width: '100%',
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
