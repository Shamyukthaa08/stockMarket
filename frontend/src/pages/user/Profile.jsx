import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import stockProfile from '../../assets/stockprofile.png';
import Navbar from '../Navbar';
import axios from 'axios';
import PortfolioGraph from './ProfileChart/PortfolioGraph';

function Profile() {
    const { user, loading } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [error, setError] = useState(null);

    // Function to fetch current prices for all stocks
    const fetchCurrentPrices = async (stocks) => {
        try {
            const portfolioWithPrices = await Promise.all(
                stocks.map(async (stock) => {
                    const currentPriceResponse = await axios.post("http://localhost:3000/api/stock/getStockPrice", {
                        symbol: stock.symbol,
                    });
                    const currentPrice = parseFloat(currentPriceResponse.data.currentPrice);
                    const purchasePrice = parseFloat(stock.purchasePrice);
                    const gainLoss = ((currentPrice - purchasePrice) * stock.quantity).toFixed(2);
                    return {
                        ...stock,
                        currentPrice,
                        gainLoss,
                    };
                })
            );
            return portfolioWithPrices;
        } catch (error) {
            console.error("Error fetching current prices:", error);
            throw error; // Re-throw the error to handle it in the calling function
        }
    };

    // Function to fetch the portfolio and current prices
    const initializePortfolio = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/stock/myStock", {
                withCredentials: true, // Include cookies for authentication
            });

            if (response.data.stocks) {
                // Fetch current prices for all stocks in the portfolio
                const portfolioWithPrices = await fetchCurrentPrices(response.data.stocks);
                setPortfolio(portfolioWithPrices); // Set portfolio with current prices and gain/loss
            }
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            setError("Failed to fetch portfolio. Please try again.");
        }
    };

    // Fetch data when the component mounts
    if (!loading && portfolio.length === 0) {
        initializePortfolio();
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Navbar />
            <div className='pt-22'>
                {/* User Info Section */}
                <div className='md:ml-20 md:mr-20 mt-2 ml-5 mr-5 md:flex justify-between items-center'>
                    <div>
                        <h1 className="text-3xl font-serif mb-1 text-indigo-600">
                            Welcome, <span>{user.name}!</span>
                        </h1>
                        <h2 className='text-gray-700 font-light'>{user.email}</h2>
                    </div>
                    <div>
                        <h2 className='text-indigo-600 text-xl font-serif'>Balance</h2>
                        <h1 className="md:text-3xl font-light mb-1 text-pink-600">
                            ${user.virtualBalance}
                        </h1>
                    </div>
                </div>

                {/* Stock Profile Image */}
                <div className='flex justify-center items-center'>
            <img src={stockProfile} className='md:w-300 md:h-140 w-200 h-100'></img>
        </div>

                {/* Portfolio Graph */}
                <div className='md:ml-20 md:mr-20 mt-4 ml-5 mr-5'>
                    <PortfolioGraph portfolio={portfolio} />
                </div>

                {/* Portfolio Table */}
                <div className='md:ml-20 md:mr-20 mt-4 ml-5 mr-5'>
                   
                    {portfolio.length > 0 ? (
                        <table className="w-full mt-4 border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-indigo-600 text-white">
                                    <th className="p-2">Symbol</th>
                                    <th className="p-2">Quantity</th>
                                    <th className="p-2">Purchase Price</th>
                                    <th className="p-2">Total Value</th>
                                    <th className="p-2">Current Price</th>
                                    <th className="p-2">Gain/Loss</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.map((stock, index) => (
                                    <tr key={stock.symbol} className="border border-gray-300 hover:bg-violet-300">
                                        <td className="p-2 text-center">{stock.symbol}</td>
                                        <td className="p-2 text-center">{stock.quantity}</td>
                                        <td className="p-2 text-center">${stock.purchasePrice.toFixed(2)}</td>
                                        <td className="p-2 text-center">${stock.totalValue.toFixed(2)}</td>
                                        {/* <td className="p-2 text-center">${stock.currentPrice.toFixed(2)}</td>
                                        <td
                                            className={`p-2 text-center ${
                                                stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}
                                        >
                                            ${stock.gainLoss}
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center mt-4 text-gray-600">No stocks in your portfolio.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;