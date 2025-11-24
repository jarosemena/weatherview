import { convertTemperature } from '../../utils/temperatureConverter';
import type { WeatherData } from '../../types/weather.types';
import type { TemperatureUnit } from '../../types/preferences.types';
import * as S from './WeatherCard.styles';

export interface WeatherCardProps {
  city: string;
  weatherData: WeatherData;
  unit: TemperatureUnit;
  onFavoriteToggle?: () => void;
  isFavorite?: boolean;
  compact?: boolean;
}

export function WeatherCard({
  city,
  weatherData,
  unit,
  onFavoriteToggle,
  isFavorite = false,
  compact = false
}: WeatherCardProps) {
  const convertTemp = (temp: number) => {
    return convertTemperature(temp, 'celsius', unit);
  };

  const formatTemp = (temp: number) => {
    const converted = convertTemp(temp);
    return `${converted}°${unit === 'celsius' ? 'C' : 'F'}`;
  };

  const iconUrl = `https://openweathermap.org/img/wn/${weatherData.conditions.icon}@2x.png`;

  return (
    <S.CardContainer $compact={compact} role="article" aria-label={`Weather information for ${weatherData.city}`}>
      <S.CityHeader $compact={compact}>
        <S.CityName $compact={compact}>{weatherData.city}, {weatherData.country}</S.CityName>
        {onFavoriteToggle && (
          <S.FavoriteButton
            onClick={onFavoriteToggle}
            $isFavorite={isFavorite}
            $compact={compact}
            aria-label={isFavorite ? `Remove ${weatherData.city} from favorites` : `Add ${weatherData.city} to favorites`}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </S.FavoriteButton>
        )}
      </S.CityHeader>

      <S.WeatherIcon $compact={compact}>
        <S.WeatherImage
          $compact={compact}
          src={iconUrl}
          alt={`Weather icon showing ${weatherData.conditions.description}`}
        />
      </S.WeatherIcon>

      <S.TemperatureDisplay $compact={compact}>
        <S.Temperature $compact={compact} aria-label={`Current temperature ${formatTemp(weatherData.temperature.current)}`}>
          {formatTemp(weatherData.temperature.current)}
        </S.Temperature>
        <S.Conditions $compact={compact}>{weatherData.conditions.main}</S.Conditions>
        <S.Description $compact={compact}>{weatherData.conditions.description}</S.Description>
        <S.FeelsLike $compact={compact} aria-label={`Feels like ${formatTemp(weatherData.temperature.feelsLike)}`}>
          Feels like {formatTemp(weatherData.temperature.feelsLike)}
        </S.FeelsLike>
        <S.MinMaxTemp $compact={compact}>
          <span aria-label={`Minimum temperature ${formatTemp(weatherData.temperature.min)}`}>
            ↓ {formatTemp(weatherData.temperature.min)}
          </span>
          <span aria-label={`Maximum temperature ${formatTemp(weatherData.temperature.max)}`}>
            ↑ {formatTemp(weatherData.temperature.max)}
          </span>
        </S.MinMaxTemp>
      </S.TemperatureDisplay>

      <S.WeatherDetails $compact={compact} role="list" aria-label="Weather details">
        <S.DetailItem role="listitem">
          <S.DetailLabel>Humidity</S.DetailLabel>
          <S.DetailValue aria-label={`Humidity ${weatherData.humidity} percent`}>
            {weatherData.humidity}%
          </S.DetailValue>
        </S.DetailItem>

        <S.DetailItem role="listitem">
          <S.DetailLabel>Wind</S.DetailLabel>
          <S.DetailValue aria-label={`Wind speed ${weatherData.wind.speed} meters per second`}>
            {weatherData.wind.speed} m/s
          </S.DetailValue>
        </S.DetailItem>

        <S.DetailItem role="listitem">
          <S.DetailLabel>Pressure</S.DetailLabel>
          <S.DetailValue aria-label={`Atmospheric pressure ${weatherData.pressure} hectopascals`}>
            {weatherData.pressure} hPa
          </S.DetailValue>
        </S.DetailItem>

        <S.DetailItem role="listitem">
          <S.DetailLabel>Visibility</S.DetailLabel>
          <S.DetailValue aria-label={`Visibility ${(weatherData.visibility / 1000).toFixed(1)} kilometers`}>
            {(weatherData.visibility / 1000).toFixed(1)} km
          </S.DetailValue>
        </S.DetailItem>
      </S.WeatherDetails>
    </S.CardContainer>
  );
}
