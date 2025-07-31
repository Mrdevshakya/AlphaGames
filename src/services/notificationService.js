import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_TYPES } from '../utils/constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Initialize notification service
  async initialize() {
    try {
      // Request permissions
      const { status } = await this.requestPermissions();
      
      if (status === 'granted') {
        // Get push token
        this.expoPushToken = await this.getPushToken();
        console.log('Push token:', this.expoPushToken);
        
        // Set up listeners
        this.setupListeners();
        
        return true;
      } else {
        console.log('Notification permissions not granted');
        return false;
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return { status: finalStatus };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return { status: 'denied' };
    }
  }

  // Get Expo push token
  async getPushToken() {
    try {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Set up notification listeners
  setupListeners() {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      this.handleNotificationReceived.bind(this)
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      this.handleNotificationResponse.bind(this)
    );
  }

  // Handle notification received
  handleNotificationReceived(notification) {
    console.log('Notification received:', notification);
    
    // You can add custom logic here based on notification type
    const { type, data } = notification.request.content.data || {};
    
    switch (type) {
      case NOTIFICATION_TYPES.GAME_INVITE:
        this.handleGameInvite(data);
        break;
      case NOTIFICATION_TYPES.TOURNAMENT_START:
        this.handleTournamentStart(data);
        break;
      case NOTIFICATION_TYPES.GAME_WIN:
        this.handleGameWin(data);
        break;
      default:
        break;
    }
  }

  // Handle notification response (when user taps notification)
  handleNotificationResponse(response) {
    console.log('Notification response:', response);
    
    const { type, data } = response.notification.request.content.data || {};
    
    // Navigate to appropriate screen based on notification type
    switch (type) {
      case NOTIFICATION_TYPES.GAME_INVITE:
        // Navigate to game screen
        break;
      case NOTIFICATION_TYPES.TOURNAMENT_START:
        // Navigate to tournament screen
        break;
      case NOTIFICATION_TYPES.WALLET_CREDIT:
        // Navigate to wallet screen
        break;
      default:
        break;
    }
  }

  // Send local notification
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(title, body, trigger, data = {}) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger,
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Cancel scheduled notification
  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  // Game-specific notification handlers
  handleGameInvite(data) {
    console.log('Game invite received:', data);
    // Add custom logic for game invites
  }

  handleTournamentStart(data) {
    console.log('Tournament starting:', data);
    // Add custom logic for tournament start
  }

  handleGameWin(data) {
    console.log('Game won:', data);
    // Add custom logic for game win
  }

  // Predefined notification templates
  async notifyGameInvite(playerName, roomCode) {
    await this.sendLocalNotification(
      'Game Invitation',
      `${playerName} invited you to join a Ludo game!`,
      {
        type: NOTIFICATION_TYPES.GAME_INVITE,
        roomCode,
        playerName,
      }
    );
  }

  async notifyTournamentStart(tournamentName, timeLeft) {
    await this.sendLocalNotification(
      'Tournament Starting',
      `${tournamentName} starts in ${timeLeft} minutes!`,
      {
        type: NOTIFICATION_TYPES.TOURNAMENT_START,
        tournamentName,
        timeLeft,
      }
    );
  }

  async notifyGameWin(amount) {
    await this.sendLocalNotification(
      'Congratulations! 🎉',
      `You won ₹${amount}! Money has been added to your wallet.`,
      {
        type: NOTIFICATION_TYPES.GAME_WIN,
        amount,
      }
    );
  }

  async notifyWalletCredit(amount, source) {
    await this.sendLocalNotification(
      'Money Added',
      `₹${amount} has been added to your wallet from ${source}`,
      {
        type: NOTIFICATION_TYPES.WALLET_CREDIT,
        amount,
        source,
      }
    );
  }

  async notifyWithdrawalSuccess(amount) {
    await this.sendLocalNotification(
      'Withdrawal Successful',
      `₹${amount} has been transferred to your account`,
      {
        type: NOTIFICATION_TYPES.WITHDRAWAL_SUCCESS,
        amount,
      }
    );
  }

  // Schedule tournament reminders
  async scheduleTournamentReminder(tournamentName, startTime) {
    try {
      const startDate = new Date(startTime);
      const reminderTime = new Date(startDate.getTime() - 15 * 60 * 1000); // 15 minutes before
      
      if (reminderTime > new Date()) {
        await this.scheduleNotification(
          'Tournament Reminder',
          `${tournamentName} starts in 15 minutes!`,
          { date: reminderTime },
          {
            type: NOTIFICATION_TYPES.TOURNAMENT_START,
            tournamentName,
          }
        );
      }
    } catch (error) {
      console.error('Error scheduling tournament reminder:', error);
    }
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Get notification settings
  async getSettings() {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return settings;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Check if notifications are enabled
  async areNotificationsEnabled() {
    try {
      const settings = await this.getSettings();
      return settings?.status === 'granted';
    } catch (error) {
      console.error('Error checking notification status:', error);
      return false;
    }
  }

  // Get all scheduled notifications
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Send push notification (for server-side implementation)
  async sendPushNotification(expoPushToken, title, body, data = {}) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
      return result;
    } catch (error) {
      console.error('Error sending push notification:', error);
      return null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;