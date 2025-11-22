import styled, { keyframes } from 'styled-components';
import type { ToastType } from './Toast';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const getBackgroundColor = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '#10b981';
    case 'error':
      return '#ef4444';
    case 'warning':
      return '#f59e0b';
    case 'info':
      return '#3b82f6';
  }
};

export const Container = styled.div<{ type: ToastType }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  background: ${({ type }) => getBackgroundColor(type)};
  color: white;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 500px;
  animation: ${slideIn} 0.3s ease-out;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export const Icon = styled.div`
  font-size: 20px;
  font-weight: bold;
  flex-shrink: 0;
`;

export const Message = styled.p`
  margin: 0;
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  line-height: 1.4;
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
  }
`;
