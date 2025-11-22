import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

export const Skeleton = styled.div<{
  $variant: 'text' | 'circular' | 'rectangular';
  $width?: string;
  $height?: string;
}>`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.background.secondary} 0%,
    ${({ theme }) => theme.colors.background.secondary}dd 50%,
    ${({ theme }) => theme.colors.background.secondary} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '20px'};
  
  border-radius: ${({ theme, $variant }) => {
    if ($variant === 'circular') return '50%';
    if ($variant === 'rectangular') return theme.borderRadius.md;
    return theme.borderRadius.sm;
  }};
`;

export const CardContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const Details = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
`;
