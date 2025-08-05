import { COLORS } from '$constants/colors';
import { playSound } from '$helpers/SoundUtils';
import { resetAndNavigate } from '$helpers/navigationUtils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';
import { useDispatch } from 'react-redux';
import { announceWinner, resetGame } from '$redux/reducers/gameSlice';
import GradientButton from './GradientButton';
import Pile from './Pile';
import { firebaseService } from '../../src/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WinnerModal: React.FC<{ winner: any }> = ({ winner }) => {

    const dispatch = useDispatch();
    const [visible, setVisible] = useState(!!winner);

    useEffect(() => {
        setVisible(!!winner);
    }, [winner]);

    const handleNewGame = async () => {
        // Award XP for game completion
        try {
            const user = await firebaseService.getCurrentUser();
            if (user) {
                // Award XP based on whether the current player won
                // Assuming player 1 is the current user
                const gameResult = winner === 1 ? 'win' : 'loss';
                await firebaseService.awardGameXp(user.uid, gameResult);
                
                // Store a flag to indicate that stats have changed
                await AsyncStorage.setItem('statsUpdated', 'true');
            }
        } catch (error) {
            console.error('Error awarding XP:', error);
        }
        
        dispatch(resetGame());
        dispatch(announceWinner(null));
        playSound('game_start');
    };

    const handleHome = async () => {
        // Award XP for game completion
        try {
            const user = await firebaseService.getCurrentUser();
            if (user) {
                // Award XP based on whether the current player won
                // Assuming player 1 is the current user
                const gameResult = winner === 1 ? 'win' : 'loss';
                await firebaseService.awardGameXp(user.uid, gameResult);
                
                // Store a flag to indicate that stats have changed
                await AsyncStorage.setItem('statsUpdated', 'true');
            }
        } catch (error) {
            console.error('Error awarding XP:', error);
        }
        
        dispatch(resetGame());
        dispatch(announceWinner(null));
        resetAndNavigate('HomeScreen');
    };

    console.log("winner",winner)

    return (
        <Modal
            style={styles.modal}
            isVisible={visible}
            backdropColor="black"
            backdropOpacity={0.8}
            onBackdropPress={() => { }}
            animationIn="zoomIn"
            animationOut="zoomOut"
            onBackButtonPress={() => { }}
        >
            <LinearGradient
                colors={['#0f0c29', '#302b63', '#24243e']}
                style={styles.gradientContainer}
            >
                <View style={styles.content}>
                    <View style={styles.pileContainer}>
                        <Pile
                            cell={false}
                            player={1}
                            pieceId="1"
                            onPress={() => {}}
                            color={COLORS.borderColor}
                        />
                    </View>

                    <Text style={styles.congratsText}> Congratulations! PLAYER {winner}</Text>
                    <Text style={styles.trophyText}>🏆</Text>
                    <Text style={styles.fireworkText}>🎆✨🎇</Text>
                    <GradientButton title='NEW GAME' onPress={handleNewGame} />
                    <GradientButton title='HOME' onPress={handleHome} />
                </View>
            </LinearGradient>
            <Text style={styles.celebrationText}>🎉</Text>
        </Modal>
    )
}

export default memo(WinnerModal);

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    gradientContainer: {
        borderRadius: 20,
        padding: 20,
        width: '96%',
        borderWidth: 2,
        borderColor: 'gold',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        width: '96%',
        alignItems: 'center'
    },
    trophyText: {
        fontSize: 80,
        marginTop: 20,
        textAlign: 'center'
    },
    fireworkText: {
        fontSize: 40,
        marginTop: 20,
        position: 'absolute',
        zIndex: -1,
        textAlign: 'center'
    },
    celebrationText: {
        fontSize: 60,
        position: 'absolute',
        bottom: 50,
        right: 50,
        zIndex: 99
    },
    pileContainer: {
        width: 90,
        height: 40,
    },
    congratsText: {
        fontSize: 18,
        color: COLORS.white,
        fontFamily: 'Philosopher-Bold',
        marginTop: 10
    }
});