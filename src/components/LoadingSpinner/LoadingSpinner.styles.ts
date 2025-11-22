import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const sizeMap = {
  small: '24px',
  medium: '48px',
  large: '64px'
};

export const Spinner = styled.div<{ $size: 'small' | 'medium' | 'large' }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border: ${({ $size }) => ($size === 'small' ? '3px' : '4px')} solid ${({ theme }) => theme.colors.background.secondary};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  text-align: center;
`;
