import React, { useEffect } from 'react';
import { useNearbyCities } from '../../hooks/useNearbyCities';
import type { City } from '../../types/weather.types';
import * as S from './NearbyCities.styles';

export interface NearbyCitiesProps {
  coordinates: { lat: number; lon: number };
  onCitySelect: (city: City) => void;
  radius?: number;
}

export const NearbyCities: React.FC<NearbyCitiesProps> = ({
  coordinates,
  onCitySelect,
  radius = 100
}) => {
  const { nearbyCities, isLoading, error, fetchNearbyCities } = useNearbyCities();

  useEffect(() => {
    if (coordinates) {
      fetchNearbyCities(coordinates, radius);
    }
  }, [coordinates, radius, fetchNearbyCities]);

  const handleCityClick = (city: City & { distance: number }) => {
    const { distance, ...cityData } = city;
    onCitySelect(cityData);
  };

  if (isLoading) {
    return (
      <S.CitiesContainer>
        <S.Title>Nearby Cities</S.Title>
        <S.LoadingMessage>Loading nearby cities...</S.LoadingMessage>
      </S.CitiesContainer>
    );
  }

  if (error) {
    return (
      <S.CitiesContainer>
        <S.Title>Nearby Cities</S.Title>
        <S.ErrorMessage>Failed to load nearby cities</S.ErrorMessage>
      </S.CitiesContainer>
    );
  }

  if (!nearbyCities || nearbyCities.length === 0) {
    return (
      <S.CitiesContainer>
        <S.Title>Nearby Cities</S.Title>
        <S.EmptyMessage>No nearby cities found</S.EmptyMessage>
      </S.CitiesContainer>
    );
  }

  return (
    <S.CitiesContainer>
      <S.Title>Nearby Cities</S.Title>
      <S.CityList>
        {nearbyCities.map((city, index) => (
          <S.CityItem
            key={`${city.name}-${city.country}-${index}`}
            onClick={() => handleCityClick(city)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCityClick(city);
              }
            }}
            aria-label={`Select ${city.name}, ${city.country} - ${city.distance.toFixed(1)} km away`}
          >
            <S.CityName>
              {city.name}, {city.country}
            </S.CityName>
            <S.DistanceLabel>{city.distance.toFixed(1)} km</S.DistanceLabel>
          </S.CityItem>
        ))}
      </S.CityList>
    </S.CitiesContainer>
  );
};
