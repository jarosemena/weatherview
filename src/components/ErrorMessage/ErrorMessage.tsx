import * as S from './ErrorMessage.styles';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorMessage({ 
  title = 'Error', 
  message, 
  onRetry, 
  showRetry = true 
}: ErrorMessageProps) {
  return (
    <S.Container data-testid="error-message">
      <S.Icon>⚠️</S.Icon>
      <S.Title>{title}</S.Title>
      <S.Message>{message}</S.Message>
      
      {showRetry && onRetry && (
        <S.RetryButton onClick={onRetry} data-testid="retry-button">
          Try Again
        </S.RetryButton>
      )}
    </S.Container>
  );
}
