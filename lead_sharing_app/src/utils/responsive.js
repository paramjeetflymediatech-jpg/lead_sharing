import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Screen breakpoints
export const BREAKPOINTS = {
    SMALL: 320,
    MEDIUM: 375,
    LARGE: 414,
    XLARGE: 768,
};

// Check device size
export const isSmallDevice = () => SCREEN_WIDTH < BREAKPOINTS.MEDIUM;
export const isMediumDevice = () => SCREEN_WIDTH >= BREAKPOINTS.MEDIUM && SCREEN_WIDTH < BREAKPOINTS.LARGE;
export const isLargeDevice = () => SCREEN_WIDTH >= BREAKPOINTS.LARGE && SCREEN_WIDTH < BREAKPOINTS.XLARGE;
export const isTablet = () => SCREEN_WIDTH >= BREAKPOINTS.XLARGE;

// Responsive sizing
export const wp = (percentage) => {
    return (SCREEN_WIDTH * percentage) / 100;
};

export const hp = (percentage) => {
    return (SCREEN_HEIGHT * percentage) / 100;
};

// Responsive font sizes
export const normalize = (size) => {
    const scale = SCREEN_WIDTH / 375; // Base on iPhone X
    const newSize = size * scale;

    if (Platform.OS === 'ios') {
        return Math.round(newSize);
    }
    return Math.round(newSize) - 2;
};

// Common responsive styles
export const commonStyles = {
    containerPadding: isSmallDevice() ? 12 : 16,
    cardPadding: isSmallDevice() ? 12 : 16,
    cardRadius: isSmallDevice() ? 10 : 12,
    buttonPadding: isSmallDevice() ? 12 : 16,

    // Font sizes
    headerFontSize: normalize(26),
    titleFontSize: normalize(20),
    bodyFontSize: normalize(15),
    smallFontSize: normalize(13),
    tinyFontSize: normalize(11),

    // Spacing
    smallSpacing: 8,
    mediumSpacing: 12,
    largeSpacing: 16,
    xlargeSpacing: 24,
};

export default {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    BREAKPOINTS,
    isSmallDevice,
    isMediumDevice,
    isLargeDevice,
    isTablet,
    wp,
    hp,
    normalize,
    commonStyles,
};
