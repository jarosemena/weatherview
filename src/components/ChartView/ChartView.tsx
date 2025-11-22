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
  data: ForecastData[];
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
  if (data.length === 0) {
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

  const getData = () => {
    const labels = data.map(item => item.date);
    
    let values: number[];
    switch (type) {
      case 'temperature':
        values = data.map(item => item.temperature.average);
        break;
      case 'precipitation':
        values = data.map(item => item.precipitation);
        break;
      case 'wind':
        values = data.map(item => item.wind.speed);
        break;
      default:
        values = [];
    }

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
