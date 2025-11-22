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

  if ((isMultiCity && multiCityData.length === 0) || (!isMultiCity && singleCityData.length === 0)) {
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
      const labels = multiCityData[0]?.map(item => item.date) || [];
      
      const datasets = cities.map((city, index) => {
        const cityData = multiCityData[index] || [];
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
      const labels = singleCityData.map(item => item.date);
      const values = getValues(singleCityData);

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
            return `${context.dataset.label}: ${context.parsed.y}${getUnit()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: type === 'precipitation',
        ticks: {
          callback: (value: any) => `${value}${getUnit()}`
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
