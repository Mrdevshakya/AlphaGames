/**
 * Error Handling and Loading States Service for Ludo Game
 * Provides comprehensive error management and user feedback
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'info';
  category: 'network' | 'game' | 'ui' | 'auth' | 'payment' | 'system';
  message: string;
  details?: any;
  stack?: string;
  userId?: string;
  gameId?: string;
  resolved: boolean;
}

export interface LoadingState {
  id: string;
  message: string;
  progress?: number;
  cancellable: boolean;
  onCancel?: () => void;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorLogs: ErrorLog[] = [];
  private loadingStates: Map<string, LoadingState> = new Map();
  private errorListeners: Array<(error: ErrorLog) => void> = [];
  private loadingListeners: Array<(loadingStates: Map<string, LoadingState>) => void> = [];
  private maxLogSize = 100;

  static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Initialize error handling service
   */
  async initialize(): Promise<void> {
    try {
      // Set up global error handlers
      this.setupGlobalErrorHandlers();
      
      // Load previous error logs
      await this.loadErrorLogs();
      
      console.log('Error handling service initialized');
    } catch (error) {
      console.error('Error initializing error handling service:', error);
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = (global as any).onunhandledrejection;
    (global as any).onunhandledrejection = (event: any) => {
      this.handleError({
        type: 'error',
        category: 'system',
        message: 'Unhandled Promise Rejection',
        details: event.reason,
        stack: event.reason?.stack
      });
      
      if (originalHandler) {
        originalHandler.call(global, event);
      }
    };

    // Handle JavaScript errors (React Native specific)
    const ErrorUtils = (global as any).ErrorUtils;
    if (ErrorUtils?.setGlobalHandler) {
      ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
        this.handleError({
          type: 'error',
          category: 'system',
          message: isFatal ? 'Fatal JavaScript Error' : 'JavaScript Error',
          details: error.message,
          stack: error.stack
        });
      });
    }
  }

  /**
   * Handle an error
   */
  async handleError(errorData: {
    type: 'error' | 'warning' | 'info';
    category: 'network' | 'game' | 'ui' | 'auth' | 'payment' | 'system';
    message: string;
    details?: any;
    stack?: string;
    userId?: string;
    gameId?: string;
    showToUser?: boolean;
    userMessage?: string;
  }): Promise<void> {
    try {
      const errorLog: ErrorLog = {
        id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        type: errorData.type,
        category: errorData.category,
        message: errorData.message,
        details: errorData.details,
        stack: errorData.stack,
        userId: errorData.userId,
        gameId: errorData.gameId,
        resolved: false
      };

      // Add to error logs
      this.errorLogs.unshift(errorLog);
      
      // Maintain log size limit
      if (this.errorLogs.length > this.maxLogSize) {
        this.errorLogs = this.errorLogs.slice(0, this.maxLogSize);
      }

      // Save to storage
      await this.saveErrorLogs();

      // Notify listeners
      this.notifyErrorListeners(errorLog);

      // Show to user if requested
      if (errorData.showToUser) {
        this.showErrorToUser(errorData.userMessage || errorData.message, errorData.type);
      }

      // Log to console
      console.error(`[${errorData.category.toUpperCase()}] ${errorData.message}`, errorData.details);

      // Send to analytics/crash reporting service in production
      this.reportToAnalytics(errorLog);

    } catch (error) {
      console.error('Error in error handler:', error);
    }
  }

  /**
   * Show error to user
   */
  private showErrorToUser(message: string, type: 'error' | 'warning' | 'info'): void {
    const title = type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information';
    
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          style: type === 'error' ? 'destructive' : 'default'
        }
      ]
    );
  }

  /**
   * Handle network errors
   */
  async handleNetworkError(error: any, context?: string): Promise<void> {
    let message = 'Network connection error';
    let userMessage = 'Please check your internet connection and try again.';

    if (error.code === 'NETWORK_ERROR') {
      message = 'Network request failed';
    } else if (error.code === 'TIMEOUT_ERROR') {
      message = 'Request timeout';
      userMessage = 'The request took too long. Please try again.';
    } else if (error.status === 404) {
      message = 'Resource not found';
      userMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      message = 'Server error';
      userMessage = 'Server is experiencing issues. Please try again later.';
    }

    await this.handleError({
      type: 'error',
      category: 'network',
      message: `${message}${context ? ` (${context})` : ''}`,
      details: error,
      showToUser: true,
      userMessage
    });
  }

  /**
   * Handle game errors
   */
  async handleGameError(error: any, gameId?: string, context?: string): Promise<void> {
    await this.handleError({
      type: 'error',
      category: 'game',
      message: `Game error${context ? ` (${context})` : ''}`,
      details: error,
      gameId,
      showToUser: true,
      userMessage: 'An error occurred in the game. Please try again.'
    });
  }

  /**
   * Handle authentication errors
   */
  async handleAuthError(error: any, context?: string): Promise<void> {
    let userMessage = 'Authentication failed. Please try logging in again.';

    if (error.code === 'auth/invalid-credential') {
      userMessage = 'Invalid credentials. Please check your login details.';
    } else if (error.code === 'auth/user-not-found') {
      userMessage = 'User account not found.';
    } else if (error.code === 'auth/too-many-requests') {
      userMessage = 'Too many failed attempts. Please try again later.';
    }

    await this.handleError({
      type: 'error',
      category: 'auth',
      message: `Authentication error${context ? ` (${context})` : ''}`,
      details: error,
      showToUser: true,
      userMessage
    });
  }

  /**
   * Handle payment errors
   */
  async handlePaymentError(error: any, context?: string): Promise<void> {
    let userMessage = 'Payment failed. Please try again or use a different payment method.';

    if (error.code === 'insufficient_funds') {
      userMessage = 'Insufficient funds in your account.';
    } else if (error.code === 'card_declined') {
      userMessage = 'Your card was declined. Please try a different card.';
    } else if (error.code === 'payment_timeout') {
      userMessage = 'Payment timed out. Please try again.';
    }

    await this.handleError({
      type: 'error',
      category: 'payment',
      message: `Payment error${context ? ` (${context})` : ''}`,
      details: error,
      showToUser: true,
      userMessage
    });
  }

  /**
   * Show loading state
   */
  showLoading(
    id: string,
    message: string,
    options: {
      progress?: number;
      cancellable?: boolean;
      onCancel?: () => void;
    } = {}
  ): void {
    const loadingState: LoadingState = {
      id,
      message,
      progress: options.progress,
      cancellable: options.cancellable || false,
      onCancel: options.onCancel
    };

    this.loadingStates.set(id, loadingState);
    this.notifyLoadingListeners();
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(id: string, progress: number, message?: string): void {
    const loadingState = this.loadingStates.get(id);
    if (loadingState) {
      loadingState.progress = progress;
      if (message) {
        loadingState.message = message;
      }
      this.notifyLoadingListeners();
    }
  }

  /**
   * Hide loading state
   */
  hideLoading(id: string): void {
    this.loadingStates.delete(id);
    this.notifyLoadingListeners();
  }

  /**
   * Hide all loading states
   */
  hideAllLoading(): void {
    this.loadingStates.clear();
    this.notifyLoadingListeners();
  }

  /**
   * Get current loading states
   */
  getLoadingStates(): Map<string, LoadingState> {
    return new Map(this.loadingStates);
  }

  /**
   * Check if any loading is active
   */
  isLoading(): boolean {
    return this.loadingStates.size > 0;
  }

  /**
   * Get error logs
   */
  getErrorLogs(filter?: {
    type?: 'error' | 'warning' | 'info';
    category?: string;
    resolved?: boolean;
    limit?: number;
  }): ErrorLog[] {
    let logs = [...this.errorLogs];

    if (filter) {
      if (filter.type) {
        logs = logs.filter(log => log.type === filter.type);
      }
      if (filter.category) {
        logs = logs.filter(log => log.category === filter.category);
      }
      if (filter.resolved !== undefined) {
        logs = logs.filter(log => log.resolved === filter.resolved);
      }
      if (filter.limit) {
        logs = logs.slice(0, filter.limit);
      }
    }

    return logs;
  }

  /**
   * Mark error as resolved
   */
  async resolveError(errorId: string): Promise<void> {
    const error = this.errorLogs.find(log => log.id === errorId);
    if (error) {
      error.resolved = true;
      await this.saveErrorLogs();
    }
  }

  /**
   * Clear error logs
   */
  async clearErrorLogs(): Promise<void> {
    this.errorLogs = [];
    await this.saveErrorLogs();
  }

  /**
   * Export error logs
   */
  exportErrorLogs(): string {
    return JSON.stringify(this.errorLogs, null, 2);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    resolved: number;
    unresolved: number;
  } {
    const stats = {
      total: this.errorLogs.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      resolved: 0,
      unresolved: 0
    };

    this.errorLogs.forEach(log => {
      // Count by type
      stats.byType[log.type] = (stats.byType[log.type] || 0) + 1;
      
      // Count by category
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      
      // Count resolved/unresolved
      if (log.resolved) {
        stats.resolved++;
      } else {
        stats.unresolved++;
      }
    });

    return stats;
  }

  /**
   * Subscribe to error events
   */
  subscribeToErrors(listener: (error: ErrorLog) => void): () => void {
    this.errorListeners.push(listener);
    
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to loading state changes
   */
  subscribeToLoading(listener: (loadingStates: Map<string, LoadingState>) => void): () => void {
    this.loadingListeners.push(listener);
    
    return () => {
      const index = this.loadingListeners.indexOf(listener);
      if (index > -1) {
        this.loadingListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify error listeners
   */
  private notifyErrorListeners(error: ErrorLog): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (error) {
        console.error('Error in error listener:', error);
      }
    });
  }

  /**
   * Notify loading listeners
   */
  private notifyLoadingListeners(): void {
    this.loadingListeners.forEach(listener => {
      try {
        listener(this.getLoadingStates());
      } catch (error) {
        console.error('Error in loading listener:', error);
      }
    });
  }

  /**
   * Load error logs from storage
   */
  private async loadErrorLogs(): Promise<void> {
    try {
      const logs = await AsyncStorage.getItem('error_logs');
      if (logs) {
        this.errorLogs = JSON.parse(logs);
      }
    } catch (error) {
      console.error('Error loading error logs:', error);
    }
  }

  /**
   * Save error logs to storage
   */
  private async saveErrorLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem('error_logs', JSON.stringify(this.errorLogs));
    } catch (error) {
      console.error('Error saving error logs:', error);
    }
  }

  /**
   * Report error to analytics service
   */
  private reportToAnalytics(error: ErrorLog): void {
    // In production, this would send to crash reporting service
    // like Crashlytics, Sentry, etc.
    console.log('Reporting error to analytics:', error.id);
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      onRetry?: (attempt: number, error: any) => void;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      onRetry
    } = options;

    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Create error boundary wrapper
   */
  createErrorBoundary<T>(
    operation: () => Promise<T>,
    context: string,
    fallback?: T
  ): Promise<T> {
    return operation().catch(async (error) => {
      await this.handleError({
        type: 'error',
        category: 'system',
        message: `Error in ${context}`,
        details: error,
        stack: error.stack
      });

      if (fallback !== undefined) {
        return fallback;
      }

      throw error;
    });
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.errorListeners = [];
    this.loadingListeners = [];
    this.loadingStates.clear();
  }
}

// Export singleton instance
export const errorHandlingService = ErrorHandlingService.getInstance();
export default errorHandlingService;