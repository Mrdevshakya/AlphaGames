/**
 * Animation Service for Ludo Game
 * Provides smooth animations and visual effects
 */

import { Animated, Easing } from 'react-native';

export class AnimationService {
  private static instance: AnimationService;
  private activeAnimations: Map<string, Animated.CompositeAnimation> = new Map();

  static getInstance(): AnimationService {
    if (!AnimationService.instance) {
      AnimationService.instance = new AnimationService();
    }
    return AnimationService.instance;
  }

  /**
   * Animate piece movement from one position to another
   */
  animatePieceMovement(
    animatedValue: Animated.ValueXY,
    fromPosition: { x: number; y: number },
    toPosition: { x: number; y: number },
    duration: number = 500,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      // Set initial position
      animatedValue.setValue(fromPosition);

      const animation = Animated.timing(animatedValue, {
        toValue: toPosition,
        duration,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      });

      animation.start((finished) => {
        if (finished) {
          onComplete?.();
          resolve();
        }
      });
    });
  }

  /**
   * Animate dice roll with rotation and scaling
   */
  animateDiceRoll(
    rotationValue: Animated.Value,
    scaleValue: Animated.Value,
    duration: number = 800
  ): Promise<void> {
    return new Promise((resolve) => {
      // Reset values
      rotationValue.setValue(0);
      scaleValue.setValue(1);

      const rotationAnimation = Animated.timing(rotationValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      const scaleAnimation = Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: duration / 2,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      Animated.parallel([rotationAnimation, scaleAnimation]).start((finished) => {
        if (finished) {
          resolve();
        }
      });
    });
  }

  /**
   * Animate piece selection with pulsing effect
   */
  animatePieceSelection(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value
  ): Animated.CompositeAnimation {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.7,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    return pulseAnimation;
  }

  /**
   * Animate piece capture with bounce effect
   */
  animatePieceCapture(
    scaleValue: Animated.Value,
    rotationValue: Animated.Value,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const captureAnimation = Animated.sequence([
        // Bounce effect
        Animated.timing(scaleValue, {
          toValue: 1.3,
          duration: 200,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        // Spin and shrink
        Animated.parallel([
          Animated.timing(rotationValue, {
            toValue: 1,
            duration: 400,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

      captureAnimation.start((finished) => {
        if (finished) {
          onComplete?.();
          resolve();
        }
      });
    });
  }

  /**
   * Animate piece reaching home with celebration effect
   */
  animatePieceHome(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    onComplete?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const homeAnimation = Animated.sequence([
        // Grow effect
        Animated.timing(scaleValue, {
          toValue: 1.5,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        // Fade out
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]);

      homeAnimation.start((finished) => {
        if (finished) {
          onComplete?.();
          resolve();
        }
      });
    });
  }

  /**
   * Animate turn indicator with sliding effect
   */
  animateTurnIndicator(
    translateValue: Animated.Value,
    fromX: number,
    toX: number,
    duration: number = 400
  ): Promise<void> {
    return new Promise((resolve) => {
      translateValue.setValue(fromX);

      const slideAnimation = Animated.timing(translateValue, {
        toValue: toX,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

      slideAnimation.start((finished) => {
        if (finished) {
          resolve();
        }
      });
    });
  }

  /**
   * Animate board entrance with fade and scale
   */
  animateBoardEntrance(
    scaleValue: Animated.Value,
    opacityValue: Animated.Value,
    duration: number = 1000
  ): Promise<void> {
    return new Promise((resolve) => {
      // Set initial values
      scaleValue.setValue(0.8);
      opacityValue.setValue(0);

      const entranceAnimation = Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: duration * 0.8,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]);

      entranceAnimation.start((finished) => {
        if (finished) {
          resolve();
        }
      });
    });
  }

  /**
   * Animate winner celebration with fireworks effect
   */
  animateWinnerCelebration(
    scaleValue: Animated.Value,
    rotationValue: Animated.Value,
    opacityValue: Animated.Value
  ): Animated.CompositeAnimation {
    const celebrationAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: 0.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rotationValue, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    return celebrationAnimation;
  }

  /**
   * Animate path highlighting for possible moves
   */
  animatePathHighlight(
    opacityValue: Animated.Value,
    scaleValue: Animated.Value
  ): Animated.CompositeAnimation {
    const highlightAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.9,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0.8,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    return highlightAnimation;
  }

  /**
   * Stop all animations for a specific key
   */
  stopAnimation(key: string): void {
    const animation = this.activeAnimations.get(key);
    if (animation) {
      animation.stop();
      this.activeAnimations.delete(key);
    }
  }

  /**
   * Stop all active animations
   */
  stopAllAnimations(): void {
    this.activeAnimations.forEach((animation) => {
      animation.stop();
    });
    this.activeAnimations.clear();
  }

  /**
   * Register an animation with a key for later control
   */
  registerAnimation(key: string, animation: Animated.CompositeAnimation): void {
    // Stop existing animation with same key
    this.stopAnimation(key);
    
    // Register new animation
    this.activeAnimations.set(key, animation);
    
    // Auto-remove when animation completes
    animation.start((finished) => {
      if (finished) {
        this.activeAnimations.delete(key);
      }
    });
  }

  /**
   * Create spring animation for interactive elements
   */
  createSpringAnimation(
    animatedValue: Animated.Value | Animated.ValueXY,
    toValue: any,
    config?: {
      tension?: number;
      friction?: number;
      speed?: number;
      bounciness?: number;
    }
  ): Animated.CompositeAnimation {
    return Animated.spring(animatedValue, {
      toValue,
      tension: config?.tension || 100,
      friction: config?.friction || 8,
      speed: config?.speed || 12,
      bounciness: config?.bounciness || 8,
      useNativeDriver: true,
    });
  }

  /**
   * Create staggered animations for multiple elements
   */
  createStaggeredAnimation(
    animations: Animated.CompositeAnimation[],
    staggerDelay: number = 100
  ): Animated.CompositeAnimation {
    return Animated.stagger(staggerDelay, animations);
  }
}

// Export singleton instance
export const animationService = AnimationService.getInstance();
export default animationService;