import { ThemeProvider } from 'styled-components';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalStyles } from './theme/GlobalStyles';
import { theme } from './theme/theme';
import { WeatherProvider } from './context/WeatherContext';
import { PreferencesProvider } from './context/PreferencesContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <WeatherProvider>
            <div>
              <h1>Weather Data Visualizer</h1>
              <p>Dashboard coming soon...</p>
            </div>
          </WeatherProvider>
        </ThemeProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

export default App;
