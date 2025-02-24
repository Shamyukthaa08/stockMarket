import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const PortfolioPieChart = ({ portfolio, walletBalance }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (portfolio.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart instance if it exists
        if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
        }

        // Prepare data for the pie chart
        const labels = ['Wallet Balance', ...portfolio.map((stock) => stock.symbol)];
        const data = [walletBalance, ...portfolio.map((stock) => stock.totalValue)];

        // Create new chart
        chartRef.current.chart = new Chart(ctx, {
            type: 'pie', // Use a pie chart
            data: {
                labels: labels, // Labels for each slice
                datasets: [
                    {
                        data: data, // Data for each slice
                        backgroundColor: [
                            'rgb(179, 141, 255)', // Wallet balance (blue)
                            ...portfolio.map((stock, index) =>
                                `hsl(${(index * 360) / portfolio.length}, 70%, 50%)` // Unique colors for each stock
                            ),
                        ],
                        borderColor: 'white',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Wallet Balance vs Investments',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: $${value.toFixed(2)}`;
                            },
                        },
                    },
                },
            },
        });
    }, [portfolio, walletBalance]);

    return <canvas ref={chartRef} />;
};

export default PortfolioPieChart;