import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import * as S from './ErrorBoundary.styles';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <S.ErrorContainer data-testid="error-boundary">
          <S.ErrorIcon>⚠️</S.ErrorIcon>
          <S.ErrorTitle>Oops! Something went wrong</S.ErrorTitle>
          <S.ErrorMessage>
            We're sorry, but something unexpected happened. Please try again.
          </S.ErrorMessage>
          
          {this.state.error && (
            <S.ErrorDetails>
              <S.ErrorDetailsTitle>Error Details:</S.ErrorDetailsTitle>
              <S.ErrorDetailsText>{this.state.error.message}</S.ErrorDetailsText>
            </S.ErrorDetails>
          )}

          <S.RetryButton onClick={this.handleRetry} data-testid="retry-button">
            Try Again
          </S.RetryButton>
        </S.ErrorContainer>
      );
    }

    return this.props.children;
  }
}
