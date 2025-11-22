import * as S from './LoadingSpinner.styles';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  return (
    <S.Container data-testid="loading-spinner">
      <S.Spinner $size={size} />
      {message && <S.Message>{message}</S.Message>}
    </S.Container>
  );
}
