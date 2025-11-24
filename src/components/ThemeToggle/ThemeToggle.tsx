import React from 'react';
import * as S from './ThemeToggle.styles';

export interface ThemeToggleProps {
  currentTheme: 'light' | 'dark';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  currentTheme,
  onToggle,
}) => {
  const icon = currentTheme === 'light' ? '🌙' : '☀️';
  const ariaLabel = currentTheme === 'light' 
    ? 'Switch to dark theme' 
    : 'Switch to light theme';

  return (
    <S.ToggleContainer>
      <S.ToggleButton
        onClick={onToggle}
        aria-label={ariaLabel}
        title={ariaLabel}
        type="button"
      >
        <S.ThemeIcon role="img" aria-hidden="true">
          {icon}
        </S.ThemeIcon>
      </S.ToggleButton>
    </S.ToggleContainer>
  );
};
