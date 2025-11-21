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
}

export function WeatherCard({
  city,
  weatherData,
  unit,
  onFavoriteToggle,
  isFavorite = false
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
    <S.CardContainer>
      <S.CityHeader>
        <S.CityName>{weatherData.city}, {weatherData.country}</S.CityName>
        {onFavoriteToggle && (
          <S.FavoriteButton
            onClick={onFavoriteToggle}
            $isFavorite={isFavorite}
            aria-label="Toggle favorite"
          >
            {isFavorite ? '★' : '☆'}
          </S.FavoriteButton>
        )}
      </S.CityHeader>

      <S.WeatherIcon>
        <S.WeatherImage
          src={iconUrl}
          alt={weatherData.conditions.description}
        />
      </S.WeatherIcon>

      <S.TemperatureDisplay>
        <S.Temperature>{formatTemp(weatherData.temperature.current)}</S.Temperature>
        <S.Conditions>{weatherData.conditions.main}</S.Conditions>
        <S.Description>{weatherData.conditions.description}</S.Description>
        <S.FeelsLike>
          Feels like {formatTemp(weatherData.temperature.feelsLike)}
        </S.FeelsLike>
        <S.MinMaxTemp>
          <span>↓ {formatTemp(weatherData.temperature.min)}</span>
          <span>↑ {formatTemp(weatherData.temperature.max)}</span>
        </S.MinMaxTemp>
      </S.TemperatureDisplay>

      <S.WeatherDetails>
        <S.DetailItem>
          <S.DetailLabel>Humidity</S.DetailLabel>
          <S.DetailValue>{weatherData.humidity}%</S.DetailValue>
        </S.DetailItem>

        <S.DetailItem>
          <S.DetailLabel>Wind</S.DetailLabel>
          <S.DetailValue>{weatherData.wind.speed} m/s</S.DetailValue>
        </S.DetailItem>

        <S.DetailItem>
          <S.DetailLabel>Pressure</S.DetailLabel>
          <S.DetailValue>{weatherData.pressure} hPa</S.DetailValue>
        </S.DetailItem>

        <S.DetailItem>
          <S.DetailLabel>Visibility</S.DetailLabel>
          <S.DetailValue>{(weatherData.visibility / 1000).toFixed(1)} km</S.DetailValue>
        </S.DetailItem>
      </S.WeatherDetails>
    </S.CardContainer>
  );
}
