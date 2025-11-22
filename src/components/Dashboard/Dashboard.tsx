import { useEffect, useState } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { WeatherCard } from '../WeatherCard/WeatherCard';
import { CitySearch } from '../CitySearch/CitySearch';
import type { City } from '../../types/weather.types';
import * as S from './Dashboard.styles';

const DEFAULT_CITY = 'London';
const MAX_RECENT_SEARCHES = 5;

export function Dashboard() {
  const { currentWeather, isLoading: isWeatherLoading, error: weatherError, fetchWeatherByCity, fetchWeatherByCoords } = useWeatherData();
  const { coordinates, isLoading: isGeoLoading, error: geoError, requestLocation } = useGeolocation();
  const { temperatureUnit } = useUserPreferences();
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [useDefaultCity, setUseDefaultCity] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
      setUseDefaultCity(true);
      fetchWeatherByCity(DEFAULT_CITY);
    }
  }, [geoError, fetchWeatherByCity, useDefaultCity]);

  const handleCitySelect = (city: City) => {
    fetchWeatherByCity(city.name);
    
    // Add to recent searches
    setRecentSearches(prev => {
      const filtered = prev.filter(c => c !== city.name);
      return [city.name, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    });
  };

  const isLoading = isGeoLoading || isWeatherLoading;
  const hasError = weatherError !== null;

  return (
    <S.DashboardContainer data-testid="dashboard-container">
      <S.HeaderSection role="banner">
        <S.HeaderContent>
          <S.Logo>
            ☀️ Weather Data Visualizer
          </S.Logo>
          <CitySearch onCitySelect={handleCitySelect} />
        </S.HeaderContent>
      </S.HeaderSection>

      <S.ContentSection role="main">
        {isLoading && (
          <S.LoadingContainer>
            <S.LoadingSpinner />
            <S.LoadingText>
              {isGeoLoading ? 'Getting your location...' : 'Loading weather data...'}
            </S.LoadingText>
          </S.LoadingContainer>
        )}

        {!isLoading && hasError && (
          <S.ErrorContainer>
            <S.ErrorTitle>Error Loading Weather Data</S.ErrorTitle>
            <S.ErrorMessage>
              {weatherError?.message || 'Unable to fetch weather data. Please try again later.'}
            </S.ErrorMessage>
          </S.ErrorContainer>
        )}

        {!isLoading && !hasError && useDefaultCity && (
          <S.InfoMessage>
            ℹ️ Using default location: {DEFAULT_CITY}
          </S.InfoMessage>
        )}

        {!isLoading && !hasError && currentWeather && (
          <S.WeatherSection>
            <WeatherCard
              city={currentWeather.city}
              weatherData={currentWeather}
              unit={temperatureUnit}
            />
          </S.WeatherSection>
        )}
      </S.ContentSection>
    </S.DashboardContainer>
  );
}
