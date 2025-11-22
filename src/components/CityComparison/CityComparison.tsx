import * as S from './CityComparison.styles';

export interface CityComparisonProps {
  cities: string[];
  onRemoveCity: (city: string) => void;
  maxCities?: number;
}

export function CityComparison({ cities, onRemoveCity, maxCities = 4 }: CityComparisonProps) {
  const canAddMore = cities.length < maxCities;

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
        {cities.map((city) => (
          <S.ComparisonCard key={city}>
            <S.CardHeader>
              <S.CityName>{city}</S.CityName>
              <S.RemoveButton
                onClick={() => onRemoveCity(city)}
                aria-label={`Remove ${city}`}
              >
                Remove
              </S.RemoveButton>
            </S.CardHeader>
            {/* Weather data will be integrated here */}
          </S.ComparisonCard>
        ))}
      </S.ComparisonGrid>

      {canAddMore && (
        <S.AddCityContainer>
          <S.AddCityButton aria-label="Add city for comparison">
            + Add City
          </S.AddCityButton>
        </S.AddCityContainer>
      )}
    </S.Container>
  );
}
