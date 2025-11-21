import { useState, useEffect, useCallback, useRef } from 'react';
import { weatherApi } from '../../services/weatherApi';
import type { City } from '../../types/weather.types';
import * as S from './CitySearch.styles';

export interface CitySearchProps {
  onCitySelect: (city: City) => void;
  placeholder?: string;
}

const DEBOUNCE_DELAY = 300;
const MIN_SEARCH_LENGTH = 3;

export function CitySearch({ onCitySelect, placeholder = 'Search city...' }: CitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchCities = useCallback(async (query: string) => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await weatherApi.searchCities(query);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (err) {
      setError('Error searching cities');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    if (searchQuery.length >= MIN_SEARCH_LENGTH) {
      debounceTimerRef.current = setTimeout(() => {
        searchCities(searchQuery);
      }, DEBOUNCE_DELAY);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, searchCities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCitySelect = (city: City) => {
    onCitySelect(city);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const formatCityDisplay = (city: City) => {
    const parts = [city.name];
    if (city.state) parts.push(city.state);
    parts.push(city.country);
    return parts.join(', ');
  };

  return (
    <S.SearchContainer>
      <S.SearchInput
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label="Search for a city"
        aria-autocomplete="list"
        aria-controls="city-suggestions"
        aria-expanded={showSuggestions}
      />

      {showSuggestions && (
        <S.SuggestionsList id="city-suggestions" role="listbox">
          {isLoading && (
            <S.LoadingMessage>Searching...</S.LoadingMessage>
          )}

          {!isLoading && error && (
            <S.ErrorMessage>{error}</S.ErrorMessage>
          )}

          {!isLoading && !error && suggestions.length === 0 && (
            <S.NoResults>No cities found</S.NoResults>
          )}

          {!isLoading && !error && suggestions.map((city, index) => (
            <S.SuggestionItem
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleCitySelect(city)}
              role="option"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCitySelect(city);
                }
              }}
            >
              <S.CityName>{city.name}</S.CityName>
              <S.CityDetails>{formatCityDisplay(city)}</S.CityDetails>
            </S.SuggestionItem>
          ))}
        </S.SuggestionsList>
      )}
    </S.SearchContainer>
  );
}
