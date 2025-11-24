import { useEffect, useState, lazy, Suspense } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { useMultipleCitiesWeather } from '../../hooks/useMultipleCitiesWeather';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useToast } from '../../context/ToastContext';
import { WeatherCard } from '../WeatherCard/WeatherCard';
import { CitySearch } from '../CitySearch/CitySearch';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { NearbyCities } from '../NearbyCities/NearbyCities';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import type { City, ChartType, TimeRange } from '../../types/weather.types';
import * as S from './Dashboard.styles';

// Lazy load heavy components
const ChartView = lazy(() => import('../ChartView/ChartView').then(module => ({ default: module.ChartView })));
const CityComparison = lazy(() => import('../CityComparison/CityComparison').then(module => ({ default: module.CityComparison })));

const DEFAULT_CITY = 'London';
const MAX_RECENT_SEARCHES = 5;
const MAX_COMPARISON_CITIES = 4;

export function Dashboard() {
  const { currentWeather, forecast, isLoading: isWeatherLoading, error: weatherError, errorMessage, isUsingCache, fetchWeatherByCity, fetchWeatherByCoords, refetch } = useWeatherData();
  const { coordinates, isLoading: isGeoLoading, error: geoError, requestLocation } = useGeolocation();
  const { temperatureUnit, theme, favoriteCities, addFavorite, removeFavorite, setTemperatureUnit, toggleTheme } = useUserPreferences();
  const { showWarning, showError, showInfo } = useToast();
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [useDefaultCity, setUseDefaultCity] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('temperature');
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [comparisonCities, setComparisonCities] = useState<string[]>([]);
  const [visibleFavoritesCount, setVisibleFavoritesCount] = useState(8); // Initial load: 8 cards (2 rows of 4)
  
  // Fetch data for comparison cities
  const comparisonData = useMultipleCitiesWeather(comparisonCities);
  
  // Fetch data for favorite cities
  const favoritesData = useMultipleCitiesWeather(favoriteCities);

  const handleToggleComparisonMode = () => {
    setIsComparisonMode(!isComparisonMode);
    if (!isComparisonMode && currentWeather) {
      // Add current city to comparison when entering comparison mode
      setComparisonCities([currentWeather.city]);
    } else {
      // Clear comparison cities when exiting
      setComparisonCities([]);
    }
  };

  const handleAddCityToComparison = (city: City) => {
    if (comparisonCities.length < MAX_COMPARISON_CITIES && !comparisonCities.includes(city.name)) {
      setComparisonCities([...comparisonCities, city.name]);
      fetchWeatherByCity(city.name);
    }
  };

  const handleRemoveCityFromComparison = (cityName: string) => {
    setComparisonCities(comparisonCities.filter(c => c !== cityName));
    if (comparisonCities.length === 1) {
      // Exit comparison mode if only one city left
      setIsComparisonMode(false);
      setComparisonCities([]);
    }
  };

  // Request geolocation on mount
  useEffect(() => {
    if (!locationAttempted) {
      requestLocation();
      setLocationAttempted(true);
    }
  }, [locationAttempted, requestLocation]);

  // Fetch weather when coordinates are available
  useEffect(() => {
    if (coordinates && !useDefaultCity) {
      fetchWeatherByCoords(coordinates.lat, coordinates.lon);
    }
  }, [coordinates, fetchWeatherByCoords, useDefaultCity]);

  // Handle geolocation error - fallback to default city
  useEffect(() => {
    if (geoError && !useDefaultCity) {
      showWarning('Unable to access your location. Using default city.');
      setUseDefaultCity(true);
      fetchWeatherByCity(DEFAULT_CITY);
    }
  }, [geoError, fetchWeatherByCity, useDefaultCity, showWarning]);

  // Show toast for weather errors (non-critical)
  useEffect(() => {
    if (weatherError && !isWeatherLoading) {
      if (isUsingCache) {
        showWarning('Unable to fetch fresh data. Showing cached weather information.');
      } else {
        showError(errorMessage || 'Failed to load weather data. Please try again.');
      }
    }
  }, [weatherError, isWeatherLoading, isUsingCache, errorMessage, showError, showWarning]);

  // Show info when using cached data
  useEffect(() => {
    if (isUsingCache && currentWeather) {
      showInfo('Showing cached data. Network connection may be unstable.');
    }
  }, [isUsingCache, currentWeather, showInfo]);

  const handleCitySelect = (city: City) => {
    if (isComparisonMode) {
      handleAddCityToComparison(city);
    } else {
      fetchWeatherByCity(city.name);
    }
    
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c !== city.name);
      return [city.name, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const handleFavoriteToggle = (city: string) => {
    if (isFavorite(city)) {
      removeFavorite(city);
    } else {
      addFavorite(city);
    }
  };

  const isFavorite = (city: string) => {
    return favoriteCities.includes(city);
  };

  const handleNearbyCitySelect = (city: City) => {
    fetchWeatherByCity(city.name);
    setUseDefaultCity(false);
  };

  // Infinite scroll logic for favorites
  const handleLoadMoreFavorites = () => {
    setVisibleFavoritesCount(prev => Math.min(prev + 4, favoriteCities.length));
  };

  const hasMoreFavorites = visibleFavoritesCount < favoriteCities.length;
  const sentinelRef = useInfiniteScroll({
    onLoadMore: handleLoadMoreFavorites,
    hasMore: hasMoreFavorites,
    isLoading: favoritesData.some(city => city.isLoading)
  });

  const isLoading = isGeoLoading || isWeatherLoading;
  const hasError = weatherError !== null;

  return (
    <S.DashboardContainer data-testid="dashboard-container">
      <S.HeaderSection role="banner">
        <S.HeaderContent>
          <S.Logo>
            ☀️ Weather Data Visualizer
          </S.Logo>
          <S.HeaderControls>
            <CitySearch onCitySelect={handleCitySelect} />
            <S.UnitToggle>
              <S.UnitButton
                $active={temperatureUnit === 'celsius'}
                onClick={() => setTemperatureUnit('celsius')}
                aria-label="Use Celsius"
              >
                °C
              </S.UnitButton>
              <S.UnitButton
                $active={temperatureUnit === 'fahrenheit'}
                onClick={() => setTemperatureUnit('fahrenheit')}
                aria-label="Use Fahrenheit"
              >
                °F
              </S.UnitButton>
            </S.UnitToggle>
            <ThemeToggle currentTheme={theme} onToggle={toggleTheme} />
          </S.HeaderControls>
        </S.HeaderContent>
      </S.HeaderSection>

      <S.ContentSection role="main" id="main-content">
        <S.MainLayout>
          <S.MainContent>
            {isLoading && (
              <S.LoadingContainer>
                <S.LoadingSpinner />
                <S.LoadingText>
                  {isGeoLoading ? 'Getting your location...' : 'Loading weather data...'}
                </S.LoadingText>
              </S.LoadingContainer>
            )}

            {!isLoading && hasError && !currentWeather && (
              <ErrorMessage
                title="Weather Data Unavailable"
                message={errorMessage || 'Unable to fetch weather data. Please try again later.'}
                onRetry={refetch}
              />
            )}

            {!isLoading && !hasError && useDefaultCity && (
              <S.InfoMessage>
                ℹ️ Using default location: {DEFAULT_CITY}
              </S.InfoMessage>
            )}

            {!isLoading && !hasError && currentWeather && (
              <>
                {isUsingCache && (
                  <S.CacheBadge>
                    ⚠️ Showing cached data - Network connection may be unstable
                  </S.CacheBadge>
                )}
                
                <S.ModeToggle
                  $active={isComparisonMode}
                  onClick={handleToggleComparisonMode}
                  aria-label={isComparisonMode ? 'Exit comparison mode' : 'Enter comparison mode'}
                >
                  {isComparisonMode ? '📊 Exit Comparison Mode' : '📊 Compare Cities'}
                </S.ModeToggle>

                {!isComparisonMode ? (
                  <>
                    <S.WeatherSection>
                      <WeatherCard
                        city={currentWeather.city}
                        weatherData={currentWeather}
                        unit={temperatureUnit}
                        onFavoriteToggle={() => handleFavoriteToggle(currentWeather.city)}
                        isFavorite={isFavorite(currentWeather.city)}
                      />
                    </S.WeatherSection>

                    {/* Favorites Grid - Show when 2+ favorites */}
                    {favoriteCities.length >= 2 && favoritesData.length > 0 && (
                      <>
                        <S.FavoritesGrid>
                          {favoritesData
                            .slice(0, visibleFavoritesCount)
                            .filter((cityData) => cityData.weather !== null)
                            .map((cityData) => (
                              <WeatherCard
                                key={cityData.city}
                                city={cityData.city}
                                weatherData={cityData.weather!}
                                unit={temperatureUnit}
                                onFavoriteToggle={() => handleFavoriteToggle(cityData.city)}
                                isFavorite={true}
                                compact={true}
                              />
                            ))}
                        </S.FavoritesGrid>
                        {/* Infinite scroll sentinel */}
                        {hasMoreFavorites && (
                          <div 
                            ref={sentinelRef} 
                            style={{ 
                              height: '20px', 
                              margin: '20px 0',
                              textAlign: 'center',
                              color: '#888',
                              fontSize: '14px',
                              fontStyle: 'italic'
                            }}
                          >
                            Loading more favorites...
                          </div>
                        )}
                      </>
                    )}

                    {forecast.length > 0 && (
                      <S.ChartSection>
                        <S.ChartControls>
                          <S.ControlGroup>
                            <S.ControlLabel>Chart Type</S.ControlLabel>
                            <S.ButtonGroup>
                              <S.ControlButton
                                $active={chartType === 'temperature'}
                                onClick={() => setChartType('temperature')}
                              >
                                Temperature
                              </S.ControlButton>
                              <S.ControlButton
                                $active={chartType === 'precipitation'}
                                onClick={() => setChartType('precipitation')}
                              >
                                Precipitation
                              </S.ControlButton>
                              <S.ControlButton
                                $active={chartType === 'wind'}
                                onClick={() => setChartType('wind')}
                              >
                                Wind
                              </S.ControlButton>
                            </S.ButtonGroup>
                          </S.ControlGroup>

                          <S.ControlGroup>
                            <S.ControlLabel>Time Range</S.ControlLabel>
                            <S.ButtonGroup>
                              <S.ControlButton
                                $active={timeRange === '24h'}
                                onClick={() => setTimeRange('24h')}
                              >
                                24h
                              </S.ControlButton>
                              <S.ControlButton
                                $active={timeRange === '7d'}
                                onClick={() => setTimeRange('7d')}
                              >
                                7d
                              </S.ControlButton>
                              <S.ControlButton
                                $active={timeRange === '30d'}
                                onClick={() => setTimeRange('30d')}
                              >
                                30d
                              </S.ControlButton>
                            </S.ButtonGroup>
                          </S.ControlGroup>
                        </S.ChartControls>

                        <Suspense fallback={<LoadingSpinner />}>
                          <ChartView
                            data={forecast}
                            type={chartType}
                            timeRange={timeRange}
                          />
                        </Suspense>
                      </S.ChartSection>
                    )}
                  </>
                ) : (
                  <S.ComparisonSection>
                    <Suspense fallback={<LoadingSpinner />}>
                      <CityComparison
                        cities={comparisonCities}
                        onRemoveCity={handleRemoveCityFromComparison}
                        maxCities={MAX_COMPARISON_CITIES}
                      />
                    </Suspense>

                    {comparisonData.some(city => city.forecast.length > 0) && (
                      <S.ChartSection>
                        <S.ChartControls>
                          <S.ControlGroup>
                            <S.ControlLabel>Chart Type</S.ControlLabel>
                            <S.ButtonGroup>
                              <S.ControlButton
                                $active={chartType === 'temperature'}
                                onClick={() => setChartType('temperature')}
                              >
                                Temperature
                              </S.ControlButton>
                              <S.ControlButton
                                $active={chartType === 'precipitation'}
                                onClick={() => setChartType('precipitation')}
                              >
                                Precipitation
                              </S.ControlButton>
                              <S.ControlButton
                                $active={chartType === 'wind'}
                                onClick={() => setChartType('wind')}
                              >
                                Wind
                              </S.ControlButton>
                            </S.ButtonGroup>
                          </S.ControlGroup>

                          <S.ControlGroup>
                            <S.ControlLabel>Time Range</S.ControlLabel>
                            <S.ButtonGroup>
                              <S.ControlButton
                                $active={timeRange === '24h'}
                                onClick={() => setTimeRange('24h')}
                              >
                                24h
                              </S.ControlButton>
                              <S.ControlButton
                                $active={timeRange === '7d'}
                                onClick={() => setTimeRange('7d')}
                              >
                                7d
                              </S.ControlButton>
                              <S.ControlButton
                                $active={timeRange === '30d'}
                                onClick={() => setTimeRange('30d')}
                              >
                                30d
                              </S.ControlButton>
                            </S.ButtonGroup>
                          </S.ControlGroup>
                        </S.ChartControls>

                        <Suspense fallback={<LoadingSpinner />}>
                          <ChartView
                            data={comparisonData.map(city => city.forecast)}
                            type={chartType}
                            timeRange={timeRange}
                            cities={comparisonCities}
                          />
                        </Suspense>
                      </S.ChartSection>
                    )}
                  </S.ComparisonSection>
                )}
              </>
            )}
          </S.MainContent>

          <S.SidebarSection>
            <S.SidebarCard>
              <S.SidebarTitle>Favorite Cities</S.SidebarTitle>
              {favoriteCities.length === 0 ? (
                <S.EmptyFavorites>
                  No favorite cities yet.
                  <br />
                  Click the star on a city to add it!
                </S.EmptyFavorites>
              ) : (
                <S.FavoritesList>
                  {favoriteCities.map((city) => (
                    <S.FavoriteItem key={city}>
                      <S.FavoriteName onClick={() => fetchWeatherByCity(city)}>
                        {city}
                      </S.FavoriteName>
                      <S.RemoveFavoriteButton
                        onClick={() => removeFavorite(city)}
                        aria-label={`Remove ${city} from favorites`}
                      >
                        ✕
                      </S.RemoveFavoriteButton>
                    </S.FavoriteItem>
                  ))}
                </S.FavoritesList>
              )}
            </S.SidebarCard>

            {/* Nearby Cities */}
            {coordinates && !geoError && (
              <S.SidebarCard>
                <NearbyCities
                  coordinates={coordinates}
                  onCitySelect={handleNearbyCitySelect}
                  radius={100}
                />
              </S.SidebarCard>
            )}
          </S.SidebarSection>
        </S.MainLayout>
      </S.ContentSection>
    </S.DashboardContainer>
  );
}
