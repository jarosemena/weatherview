import styled from 'styled-components';

export const CardContainer = styled.div<{ $compact?: boolean }>`
  background: ${({ theme }) => theme.colors.background.main};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme, $compact }) => $compact ? theme.spacing.md : theme.spacing.lg};
  transition: transform 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease, background-color 0.3s ease;
  animation: fadeInUp 0.5s ease-out;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
  }
`;

export const CityHeader = styled.div<{ $compact?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme, $compact }) => $compact ? theme.spacing.sm : theme.spacing.md};
`;

export const CityName = styled.h2<{ $compact?: boolean }>`
  font-size: ${({ theme, $compact }) => 
    $compact ? theme.typography.fontSize.md : theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme, $compact }) => 
      $compact ? theme.typography.fontSize.sm : theme.typography.fontSize.lg};
  }
`;

export const FavoriteButton = styled.button<{ $isFavorite?: boolean; $compact?: boolean }>`
  background: none;
  border: none;
  font-size: ${({ theme, $compact }) => 
    $compact ? theme.typography.fontSize.md : theme.typography.fontSize.xl};
  color: ${({ theme, $isFavorite }) => 
    $isFavorite ? theme.colors.warning : theme.colors.text.secondary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.warning};
    transform: scale(1.1);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const WeatherIcon = styled.div<{ $compact?: boolean }>`
  text-align: center;
  margin-bottom: ${({ theme, $compact }) => $compact ? theme.spacing.xs : theme.spacing.md};
`;

export const WeatherImage = styled.img<{ $compact?: boolean }>`
  width: ${({ $compact }) => $compact ? '60px' : '100px'};
  height: ${({ $compact }) => $compact ? '60px' : '100px'};
  animation: float 3s ease-in-out infinite;

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const TemperatureDisplay = styled.div<{ $compact?: boolean }>`
  text-align: center;
  margin-bottom: ${({ theme, $compact }) => $compact ? theme.spacing.sm : theme.spacing.lg};
`;

export const Temperature = styled.div<{ $compact?: boolean }>`
  font-size: ${({ theme, $compact }) => 
    $compact ? theme.typography.fontSize.xl : theme.typography.fontSize.xxl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  animation: fadeIn 0.6s ease-out 0.2s both;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const Conditions = styled.div<{ $compact?: boolean }>`
  font-size: ${({ theme, $compact }) => 
    $compact ? theme.typography.fontSize.sm : theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

export const Description = styled.div<{ $compact?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: capitalize;
  display: ${({ $compact }) => $compact ? 'none' : 'block'};
`;

export const FeelsLike = styled.div<{ $compact?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: ${({ $compact }) => $compact ? 'none' : 'block'};
`;

export const WeatherDetails = styled.div<{ $compact?: boolean }>`
  display: ${({ $compact }) => $compact ? 'none' : 'grid'};
  grid-template-columns: repeat(2, 1fr);
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.background.secondary};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
`;

export const DetailLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

export const DetailValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

export const MinMaxTemp = styled.div<{ $compact?: boolean }>`
  display: ${({ $compact }) => $compact ? 'none' : 'flex'};
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
