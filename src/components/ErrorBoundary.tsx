import React, { Component, ReactNode } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { TimelineTheme } from '../types';

interface ErrorBoundaryProps {
  children: ReactNode;
  theme: TimelineTheme;
  onError?: (error: Error, errorInfo: any) => void;
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
    theme: TimelineTheme;
  }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

const AnimatedErrorView = ({ 
  error, 
  resetError, 
  theme 
}: { 
  error: Error; 
  resetError: () => void; 
  theme: TimelineTheme;
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleRetry = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 100 })
    );
    setTimeout(resetError, 200);
  };

  return (
    <Animated.View style={[styles.errorContainer, containerStyle]}>
      <View style={[styles.errorCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>
          {error.message || 'An unexpected error occurred'}
        </Text>
        
        <View style={styles.errorActions}>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.selection.border }]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading timeline"
          >
            <Text style={[styles.retryButtonText, { color: 'white' }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
        
        {__DEV__ && (
          <View style={styles.debugInfo}>
            <Text style={[styles.debugTitle, { color: theme.colors.text.accent }]}>
              Debug Info:
            </Text>
            <Text style={[styles.debugText, { color: theme.colors.text.accent }]}>
              {error.stack}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

class TimelineErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({
      errorInfo,
    });

    // Log error to analytics/crash reporting
    this.props.onError?.(error, errorInfo);
    
    console.error('Timeline Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent || AnimatedErrorView;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          theme={this.props.theme}
        />
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorActions: {
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 8,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default TimelineErrorBoundary;
