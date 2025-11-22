import { useMultipleCitiesWeather } from '../../hooks/useMultipleCitiesWeather';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { celsiusToFahrenheit } from '../../utils/temperatureConverter';
import * as S from './CityComparison.styles';

export interface CityComparisonProps {
  cities: string[];
  onRemoveCity: (city: string) => void;
  maxCities?: number;
}

export function CityComparison({ cities, onRemoveCity, maxCities = 4 }: CityComparisonProps) {
  const citiesData = useMultipleCitiesWeather(cities);
  const { temperatureUnit } = useUserPreferences();
  const canAddMore = cities.length < maxCities;

  const convertTemp = (temp: number) => {
    return temperatureUnit === 'fahrenheit' 
      ? celsiusToFahrenheit(temp)
      : temp;
  };

  const formatTemp = (temp: number) => {
    const converted = convertTemp(temp);
    const unit = temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    return `${Math.round(converted)}${unit}`;
  };

  if (cities.length === 0) {
    return (
      <S.Container>
        <S.EmptyState>
          No cities selected for comparison.
          <br />
          Add cities to compare their weather data.
        </S.EmptyState>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <S.Title>City Comparison</S.Title>
        <S.CityCount>
          {cities.length} of {maxCities} cities
        </S.CityCount>
      </S.Header>

      <S.ComparisonGrid data-testid="comparison-grid">
        {citiesData.map((cityData) => (
          <S.ComparisonCard key={cityData.city}>
            <S.CardHeader>
              <S.CityName>{cityData.city}</S.CityName>
              <S.RemoveButton
                onClick={() => onRemoveCity(cityData.city)}
                aria-label={`Remove ${cityData.city}`}
              >
                ✕
              </S.RemoveButton>
            </S.CardHeader>

            {cityData.isLoading && (
              <S.LoadingContainer>
                <S.LoadingSpinner />
                <S.LoadingText>Loading...</S.LoadingText>
              </S.LoadingContainer>
            )}

            {cityData.error && (
              <S.ErrorContainer>
                <S.ErrorText>Failed to load data</S.ErrorText>
              </S.ErrorContainer>
            )}

            {!cityData.isLoading && !cityData.error && cityData.weather && (
              <S.WeatherContent>
                <S.WeatherIcon>
                  {cityData.weather.conditions.icon ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${cityData.weather.conditions.icon}@2x.png`}
                      alt={cityData.weather.conditions.description}
                    />
                  ) : (
                    '☀️'
                  )}
                </S.WeatherIcon>

                <S.Temperature>
                  {formatTemp(cityData.weather.temperature.current)}
                </S.Temperature>

                <S.Conditions>
                  {cityData.weather.conditions.description}
                </S.Conditions>

                <S.WeatherDetails>
                  <S.DetailItem>
                    <S.DetailLabel>Feels Like</S.DetailLabel>
                    <S.DetailValue>
                      {formatTemp(cityData.weather.temperature.feelsLike)}
                    </S.DetailValue>
                  </S.DetailItem>

                  <S.DetailItem>
                    <S.DetailLabel>Humidity</S.DetailLabel>
                    <S.DetailValue>{cityData.weather.humidity}%</S.DetailValue>
                  </S.DetailItem>

                  <S.DetailItem>
                    <S.DetailLabel>Wind</S.DetailLabel>
                    <S.DetailValue>{cityData.weather.wind.speed} m/s</S.DetailValue>
                  </S.DetailItem>

                  <S.DetailItem>
                    <S.DetailLabel>Pressure</S.DetailLabel>
                    <S.DetailValue>{cityData.weather.pressure} hPa</S.DetailValue>
                  </S.DetailItem>
                </S.WeatherDetails>
              </S.WeatherContent>
            )}
          </S.ComparisonCard>
        ))}
      </S.ComparisonGrid>

      {canAddMore && (
        <S.AddCityContainer>
          <S.InfoText>
            Search for a city above to add it to the comparison
          </S.InfoText>
        </S.AddCityContainer>
      )}
    </S.Container>
  );
}
