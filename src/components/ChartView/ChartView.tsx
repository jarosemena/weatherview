import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import type { ForecastData, ChartType, TimeRange } from '../../types/weather.types';
import * as S from './ChartView.styles';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ChartViewProps {
  data: ForecastData[] | ForecastData[][];
  type: ChartType;
  timeRange: TimeRange;
  cities?: string[];
}

const CHART_COLORS = [
  '#2196F3', // Blue
  '#FF9800', // Orange
  '#4CAF50', // Green
  '#F44336'  // Red
];

export function ChartView({ data, type, timeRange, cities = [] }: ChartViewProps) {
  const isMultiCity = Array.isArray(data[0]) && Array.isArray(data);
  const singleCityData = !isMultiCity ? data as ForecastData[] : [];
  const multiCityData = isMultiCity ? data as ForecastData[][] : [];

  // Filter data based on timeRange
  const filterDataByTimeRange = (forecastData: ForecastData[]): ForecastData[] => {
    if (!forecastData || forecastData.length === 0) {
      return forecastData;
    }
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today
    let maxDays: number;
    
    switch (timeRange) {
      case '1d':
        maxDays = 1;
        break;
      case '3d':
        maxDays = 3;
        break;
      case '5d':
        maxDays = 5;
        break;
      default:
        return forecastData;
    }
    
    // If we have less data than requested, return all data
    if (forecastData.length <= maxDays) {
      return forecastData;
    }
    
    // Otherwise, limit to the requested number of days
    return forecastData.slice(0, maxDays);
  };

  // Apply filtering
  const filteredSingleCityData = filterDataByTimeRange(singleCityData);
  const filteredMultiCityData = multiCityData.map(cityData => filterDataByTimeRange(cityData));

  if ((isMultiCity && filteredMultiCityData.length === 0) || (!isMultiCity && filteredSingleCityData.length === 0)) {
    return (
      <S.ChartContainer>
        <S.NoDataMessage>No data available</S.NoDataMessage>
      </S.ChartContainer>
    );
  }

  const getChartTitle = () => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    return `${typeLabel} - ${timeRange}`;
  };

  const getUnit = () => {
    switch (type) {
      case 'temperature':
        return '°C';
      case 'precipitation':
        return '%';
      case 'wind':
        return 'm/s';
      default:
        return '';
    }
  };

  const getValues = (forecastData: ForecastData[]) => {
    switch (type) {
      case 'temperature':
        return forecastData.map(item => item.temperature.average);
      case 'precipitation':
        return forecastData.map(item => item.precipitation);
      case 'wind':
        return forecastData.map(item => item.wind.speed);
      default:
        return [];
    }
  };

  const getData = () => {
    if (isMultiCity && cities.length > 0) {
      // Multi-city comparison mode
      const labels = filteredMultiCityData[0]?.map(item => item.date) || [];
      
      const datasets = cities.map((city, index) => {
        const cityData = filteredMultiCityData[index] || [];
        const values = getValues(cityData);
        const color = CHART_COLORS[index % CHART_COLORS.length];

        return {
          label: city,
          data: values,
          borderColor: color,
          backgroundColor: type === 'precipitation' ? color : `${color}33`,
          fill: type !== 'precipitation',
          tension: 0.4
        };
      });

      return { labels, datasets };
    } else {
      // Single city mode
      const labels = filteredSingleCityData.map(item => item.date);
      const values = getValues(filteredSingleCityData);

      return {
        labels,
        datasets: [
          {
            label: type.charAt(0).toUpperCase() + type.slice(1),
            data: values,
            borderColor: CHART_COLORS[0],
            backgroundColor: type === 'precipitation' ? CHART_COLORS[0] : `${CHART_COLORS[0]}33`,
            fill: type !== 'precipitation',
            tension: 0.4
          }
        ]
      };
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            // Round to integer in tooltip
            const roundedValue = Math.round(context.parsed.y);
            return `${context.dataset.label}: ${roundedValue}${getUnit()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: type === 'precipitation',
        ticks: {
          // Round to integers and prevent duplicates
          stepSize: 1,
          callback: (value: any) => {
            const roundedValue = Math.round(value);
            // Only show integer values
            if (value === roundedValue) {
              return `${roundedValue}${getUnit()}`;
            }
            return null;
          }
        }
      }
    }
  };

  const chartData = getData();
  const ChartComponent = type === 'precipitation' ? Bar : Line;

  return (
    <S.ChartContainer>
      <S.ChartHeader>
        <S.ChartTitle>
          {getChartTitle()}
          <S.UnitLabel>{getUnit()}</S.UnitLabel>
        </S.ChartTitle>
      </S.ChartHeader>

      <S.ChartCanvas>
        <ChartComponent data={chartData} options={options} />
      </S.ChartCanvas>

      {cities.length > 1 && (
        <S.ChartLegend>
          {cities.map((city, index) => (
            <S.LegendItem key={city}>
              <S.LegendColor $color={CHART_COLORS[index % CHART_COLORS.length]} />
              <S.LegendLabel>{city}</S.LegendLabel>
            </S.LegendItem>
          ))}
        </S.ChartLegend>
      )}
    </S.ChartContainer>
  );
}
