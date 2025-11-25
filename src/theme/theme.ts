export const lightTheme = {
  colors: {
    primary: '#2196F3',
    secondary: '#FFC107',
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    background: {
      main: '#FFFFFF',
      secondary: '#F5F5F5',
      card: '#FFFFFF'
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#BDBDBD'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  }
};

export const darkTheme = {
  colors: {
    primary: '#64B5F6',
    secondary: '#FFD54F',
    success: '#81C784',
    error: '#E57373',
    warning: '#FFB74D',
    background: {
      main: '#121212',
      secondary: '#1E1E1E',
      card: '#2C2C2C'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#666666'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  }
};

export const commonTheme = {
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1440px'
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      xxl: '32px'
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.16)',
    lg: '0 10px 20px rgba(0,0,0,0.19)'
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    round: '50%'
  }
};

// Función helper para obtener el tema actual
export const getTheme = (mode: 'light' | 'dark') => ({
  ...(mode === 'light' ? lightTheme : darkTheme),
  ...commonTheme
});

// Mantener compatibilidad con código existente
export const theme = getTheme('light');

export type Theme = ReturnType<typeof getTheme>;
