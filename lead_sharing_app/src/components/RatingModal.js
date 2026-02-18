import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { normalize, wp, hp } from '../utils/responsive';

export default function RatingModal({ visible, onClose, onSubmit, tradespersonName }) {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(rating, review);
            // Reset state
            setRating(0);
            setReview('');
            onClose();
        } catch (error) {
            console.error('Error submitting rating:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setReview('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Rate Tradesperson</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {tradespersonName && (
                        <Text style={styles.subtitle}>
                            How was your experience with {tradespersonName}?
                        </Text>
                    )}

                    {/* Star Rating */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                            >
                                <Feather
                                    name={star <= rating ? 'star' : 'star'}
                                    size={normalize(32)}
                                    color={star <= rating ? '#FCD34D' : '#D1D5DB'}
                                    fill={star <= rating ? '#FCD34D' : 'transparent'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {rating > 0 && (
                        <Text style={styles.ratingText}>
                            {rating === 1 && 'Poor'}
                            {rating === 2 && 'Fair'}
                            {rating === 3 && 'Good'}
                            {rating === 4 && 'Very Good'}
                            {rating === 5 && 'Excellent'}
                        </Text>
                    )}

                    {/* Review Text */}
                    <Text style={styles.label}>Review (Optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Share your experience..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        numberOfLines={4}
                        value={review}
                        onChangeText={setReview}
                        maxLength={500}
                    />

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.submitButton,
                                (rating === 0 || submitting) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={rating === 0 || submitting}
                        >
                            <Text style={styles.submitButtonText}>
                                {submitting ? 'Submitting...' : 'Submit Rating'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: wp(90),
        maxWidth: 500,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: normalize(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: normalize(16),
    },
    title: {
        fontSize: normalize(20),
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: normalize(4),
    },
    subtitle: {
        fontSize: normalize(14),
        color: '#6B7280',
        marginBottom: normalize(20),
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: normalize(12),
        gap: normalize(8),
    },
    starButton: {
        padding: normalize(4),
    },
    ratingText: {
        textAlign: 'center',
        fontSize: normalize(16),
        fontWeight: '600',
        color: '#2563EB',
        marginBottom: normalize(20),
    },
    label: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: normalize(8),
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        padding: normalize(12),
        fontSize: normalize(14),
        color: '#111827',
        minHeight: hp(10),
        textAlignVertical: 'top',
        marginBottom: normalize(20),
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: normalize(12),
    },
    button: {
        flex: 1,
        paddingVertical: normalize(12),
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#6B7280',
    },
    submitButton: {
        backgroundColor: '#2563EB',
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    submitButtonText: {
        fontSize: normalize(14),
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
