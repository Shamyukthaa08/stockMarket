import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const HistoricalPredictionChart = ({ data }) => {
  const chartData = {
    labels: data?.historical?.dates || [],
    datasets: [
      {
        label: 'Actual Price',
        data: data?.historical?.actual || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      },
      {
        label: 'Predicted Price',
        data: data?.historical?.predicted || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1
      }
    ]
  };

  return <Line data={chartData} />;
};

export const FuturePredictionChart = ({ data }) => {
  const chartData = {
    labels: data?.future?.dates || [],
    datasets: [
      {
        label: 'Future Predicted Price',
        data: data?.future?.predicted || [],
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        tension: 0.1
      }
    ]
  };

  return <Line data={chartData} />;
};

export const SentimentChart = ({ data }) => {
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [{
      data: [
        data.sentiment_counts.positive,
        data.sentiment_counts.neutral,
        data.sentiment_counts.negative
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(255, 99, 132, 0.6)'
      ]
    }]
  };

  return <Doughnut data={chartData} />;
};