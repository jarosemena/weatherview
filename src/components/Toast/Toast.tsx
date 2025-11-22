import { useEffect } from 'react';
import * as S from './Toast.styles';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '⚠';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
    }
  };

  return (
    <S.Container type={type} data-testid={`toast-${id}`}>
      <S.Icon>{getIcon()}</S.Icon>
      <S.Message>{message}</S.Message>
      <S.CloseButton onClick={() => onClose(id)} aria-label="Close notification">
        ✕
      </S.CloseButton>
    </S.Container>
  );
}
