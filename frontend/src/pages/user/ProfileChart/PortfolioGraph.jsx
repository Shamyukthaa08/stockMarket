import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

const PortfolioGraph = ({ portfolio }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        if (portfolio.length === 0) return;

        const ctx = chartRef.current.getContext('2d');

        // Destroy existing chart instance if it exists
        if (chartRef.current.chart) {
            chartRef.current.chart.destroy();
        }

        // Create new chart
        chartRef.current.chart = new Chart(ctx, {
            type: 'bar', // Use 'bar' or 'line'
            data: {
                labels: portfolio.map((stock) => stock.symbol), // Stock symbols as labels
                datasets: [
                    {
                        label: 'Purchase Price',
                        data: portfolio.map((stock) => stock.purchasePrice),
                        backgroundColor: 'rgb(114, 75, 192)', 
                        borderColor: 'rgba(95,136,241,255)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Current Price',
                        data: portfolio.map((stock) => stock.currentPrice),
                        backgroundColor: 'rgba(235, 54, 145, 0.6)', 
                        borderColor: 'rgba(255,168,200,255)',
                        borderWidth: 1,
                    },
                    {
                        label: 'Gain/Loss',
                        data: portfolio.map((stock) => stock.gainLoss),
                        backgroundColor: portfolio.map((stock) =>
                            stock.gainLoss >= 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)' // Green for gain, red for loss
                        ),
                        borderColor: portfolio.map((stock) =>
                            stock.gainLoss >= 0 ? 'rgb(0, 226, 56)' : 'rgba(255, 0, 0, 1)'
                        ),
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Price ($)',
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Stock Symbol',
                        },
                    },
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Portfolio Performance',
                    },
                },
            },
        });
    }, [portfolio]);

    return <canvas ref={chartRef} />;
};

export default PortfolioGraph;