import { COLORS } from '$constants/colors';
import { playSound } from '$helpers/SoundUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const iconSize = 20;

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    iconColor?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    iconColor = '#d5be3e',
}) => {
    return (
        <View
            style={{
                borderRadius: 10,
                borderWidth: 2,
                borderColor: '#000',
                marginVertical: 10,
            }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    playSound('ui');
                    onPress();
                }}
                style={styles.buttonContainer}>
                <LinearGradient
                    colors={['#4c669f', '#3b5998', '#192f6a']}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}>
                    <Text style={[styles.iconText, { color: iconColor }]}>
                        {title == 'RESUME' ? '⏸️' :
                         title == 'NEW GAME' ? '▶️' :
                         title == 'VS CPU' ? '🖥️' :
                         title == 'HOME' ? '🏠' : '👥'}
                    </Text>
                    <Text numberOfLines={1} style={styles.buttonText}>{title}</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

export default GradientButton;

const styles = StyleSheet.create({
    buttonContainer: {
        borderWidth: 2,
        borderRadius: 10,
        elevation: 5,
        backgroundColor: COLORS.white,
        shadowColor: '#d5be3e',
        shadowOpacity: 0.5,
        shadowOffset: { width: 1, height: 1 },
        shadowRadius: 10,
        borderColor: '#d5be3e',
        width: 220,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        width: '70%',
        textAlign: 'left',
        fontWeight: 'bold'
    },
    iconText: {
        fontSize: 18,
        width: 30,
        textAlign: 'center'
    },
});
