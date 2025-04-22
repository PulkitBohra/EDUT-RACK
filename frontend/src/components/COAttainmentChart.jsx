import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const COAttainmentChart = ({ data, threshold }) => {
  // Prepare chart data
  const chartData = {
    labels: data.map(row => row.co),
    datasets: [
      {
        label: 'Attainment (%)',
        data: data.map(row => row.overallPercentage),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Target (%)',
        data: data.map(() => threshold),
        backgroundColor: 'rgba(255, 99, 132, 0.7)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'CO Attainment vs Target',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: function(value) {
            return `${value}%`;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Course Outcomes',
          font: {
            weight: 'bold'
          }
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Bar 
        data={chartData} 
        options={options} 
        redraw
      />
    </div>
  );
};

export default COAttainmentChart;