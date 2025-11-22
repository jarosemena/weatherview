import { useEffect, useState } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { WeatherCard } from '../WeatherCard/WeatherCard';
import * as S from './Dashboard.styles';

const DEFAULT_CITY = 'London';

export function Dashboard() {
  const { currentWeather, isLoading: isWeatherLoading, error: weatherError, fetchWeatherByCity, fetchWeatherByCoords } = useWeatherData();
  const { coordinates, isLoading: isGeoLoading, error: geoError, requestLocation } = useGeolocation();
  const { temperatureUnit } = useUserPreferences();
  const [locationAttempted, setLocationAttempted] = useState(false);
  const [useDefaultCity, setUseDefaultCity] = useState(false);

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

  const isLoading = isGeoLoading || isWeatherLoading;
  const hasError = weatherError !== null;

  return (
    <S.DashboardContainer data-testid="dashboard-container">
      <S.HeaderSection role="banner">
        <S.HeaderContent>
          <S.Logo>
            ☀️ Weather Data Visualizer
          </S.Logo>
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
