import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { UptimeHistory } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface UptimeChartProps {
  data: UptimeHistory[];
  days?: number;
  className?: string;
}

const UptimeChart: React.FC<UptimeChartProps> = ({ 
  data, 
  days = 30, 
  className 
}) => {
  // Limit data to specified number of days
  const chartData = data.slice(0, days);
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 0.8,
        to: 0.2,
        loop: false
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return `Uptime: ${context.parsed.y.toFixed(2)}%`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7,
          color: 'rgba(156, 163, 175, 0.7)',
        }
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        ticks: {
          stepSize: 25,
          color: 'rgba(156, 163, 175, 0.7)',
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  const chartDataset = {
    labels: chartData.map(item => item.date),
    datasets: [
      {
        data: chartData.map(item => item.uptime),
        borderColor: 'rgba(79, 70, 229, 1)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 5,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointHoverBackgroundColor: 'rgba(79, 70, 229, 1)',
      },
    ],
  };

  return (
    <div className={className}>
      <div className="h-64">
        <Line options={options as any} data={chartDataset} />
      </div>
    </div>
  );
};

export default UptimeChart;