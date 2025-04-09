import React from 'react';
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
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut, PolarArea, Radar } from 'react-chartjs-2';

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
  ArcElement,
  RadialLinearScale,
  Filler
);

// Demo data for visualization
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

// Reading stats chart component
export const ReadingStatsChart = () => {
  const data: ChartData = {
    labels: months,
    datasets: [
      {
        label: 'Reading Time (minutes)',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      },
    ],
  };
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Reading Time History</h3>
      <div className="h-64">
        <Line 
          data={data} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Monthly Reading Statistics'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

// Genre distribution chart component
export const GenreDistributionChart = () => {
  const data: ChartData = {
    labels: ['Horror', 'Sci-Fi', 'Fantasy', 'Mystery', 'Thriller'],
    datasets: [
      {
        label: 'Stories Read',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">Genre Distribution</h3>
      <div className="h-64">
        <Doughnut 
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right' as const,
              }
            }
          }}
        />
      </div>
    </div>
  );
};

// Combined dashboard component
export const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reading Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReadingStatsChart />
        <GenreDistributionChart />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;