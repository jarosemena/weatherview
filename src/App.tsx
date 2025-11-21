import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './theme/GlobalStyles';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div>
        <h1>Weather Data Visualizer</h1>
        <p>Dashboard coming soon...</p>
      </div>
    </ThemeProvider>
  );
}

export default App;
