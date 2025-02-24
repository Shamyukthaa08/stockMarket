import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import Navbar from "../Navbar";
import axios from "axios";
import PortfolioGraph from "./ProfileChart/PortfolioGraph";
import PortfolioPieChart from "./ProfileChart/PortfolioPieChart";
import Modal from "./ProfileChart/Model";

function Profile() {
    const { user, loading } = useAuth();
    const [portfolio, setPortfolio] = useState([]);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1); // Default quantity is 1


  
    //////////////////////////
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);

    const openBuyModal = (stock) => {
        setSelectedStock(stock);
        setIsBuyModalOpen(true);
    };

    const openSellModal = (stock) => {
        setSelectedStock(stock);
        setIsSellModalOpen(true);
    };

    const closeModal = () => {
        setIsBuyModalOpen(false);
        setIsSellModalOpen(false);
        setSelectedStock(null);
        setQuantity(1); // Reset quantity to 1
    };

    const handleBuy = async () => {
        try {
            // Ensure quantity is a valid number
            const parsedQuantity = parseInt(quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
                alert("Please enter a valid quantity between 1 and 100.");
                return;
            }
    
            const response = await axios.post(
                "http://localhost:3000/api/stock/buyStock",
                {
                    symbol: selectedStock?.symbol,
                    quantity: parsedQuantity,
                    purchasePrice: selectedStock?.currentPrice,
                },
                {
                    withCredentials: true, // Include cookies for authentication
                }
            );
    
            // Update the portfolio and user balance
            initializePortfolio();
            closeModal();
        } catch (error) {
            console.error("Error buying stock:", error);
        }
    };
    
    const handleSell = async () => {
        try {
            // Ensure quantity is a valid number
            const parsedQuantity = parseInt(quantity, 10);
            if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > selectedStock?.quantity) {
                alert("Please enter a valid quantity.");
                return;
            }
    
            const response = await axios.post(
                "http://localhost:3000/api/stock/sellStock",
                {
                    symbol: selectedStock?.symbol,
                    quantity: parsedQuantity,
                    price: selectedStock?.currentPrice,
                },
                {
                    withCredentials: true, // Include cookies for authentication
                }
            );
    
            // Update the portfolio and user balance
            initializePortfolio();
            closeModal();
        } catch (error) {
            console.error("Error selling stock:", error);
        }
    };
//////////////////////////

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
                    console.log(gainLoss);
                    return {
                        ...stock,
                        currentPrice,
                        gainLoss,
                        totalValue: stock.quantity * currentPrice, // Store total value for Pie Chart
                    };
                })
            );
            return portfolioWithPrices;
        } catch (error) {
            console.error("Error fetching current prices:", error);
            throw error;
        }
    };

    const initializePortfolio = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/stock/myStock", {
                withCredentials: true,
            });

            if (response.data.stocks) {
                const portfolioWithPrices = await fetchCurrentPrices(response.data.stocks);
                setPortfolio(portfolioWithPrices);
            }
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            setError("Failed to fetch portfolio. Please try again.");
        }
    };

    useEffect(() => {
        if (!loading && portfolio.length === 0) {
            initializePortfolio();
        }
    }, [loading, portfolio.length]);

    const totalInvestment = portfolio.reduce((acc, stock) => acc + stock.purchasePrice * stock.quantity, 0);
    const totalCurrentValue = portfolio.reduce((acc, stock) => acc + stock.currentPrice * stock.quantity, 0);
    const totalGainLoss = totalCurrentValue - totalInvestment;

    if (loading) {
        return <div className="flex justify-center items-center h-screen text-indigo-600">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 mt-22">
            <Navbar />
            <div className="p-8">


           {/* Buy Modal */}
<Modal isOpen={isBuyModalOpen} onClose={closeModal}>
    <h2 className="text-xl font-semibold text-indigo-600 mb-4">Buy {selectedStock?.symbol}</h2>
    <p className="text-gray-600">Current Price: ${selectedStock?.currentPrice?.toFixed(2)}</p>
    <div className="mt-4">
        <label className="block text-gray-700">Quantity (1-100)</label>
        <input
            type="number"
            min="1"
            max="100"
            value={quantity} // Bind to quantity state
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))} // Update quantity state
            className="w-full p-2 border border-gray-300 rounded-lg"
        />
    </div>
    <div className="mt-6 flex justify-end">
        <button
            onClick={handleBuy} // Call handleBuy directly
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
            Buy
        </button>
    </div>
</Modal>

{/* Sell Modal */}
<Modal isOpen={isSellModalOpen} onClose={closeModal}>
    <h2 className="text-xl font-semibold text-indigo-600 mb-4">Sell {selectedStock?.symbol}</h2>
    <p className="text-gray-600">Purchase Price: ${selectedStock?.purchasePrice?.toFixed(2)}</p>
    <p className="text-gray-600">Current Price: ${selectedStock?.currentPrice?.toFixed(2)}</p>
    <p className="text-gray-600">Owned Quantity: {selectedStock?.quantity}</p>
    <div className="mt-4">
        <label className="block text-gray-700">Quantity to Sell (1-{selectedStock?.quantity})</label>
        <input
            type="number"
            min="1"
            max={selectedStock?.quantity}
            value={quantity} // Bind to quantity state
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))} // Update quantity state
            className="w-full p-2 border border-gray-300 rounded-lg"
        />
    </div>
    <div className="mt-6 flex justify-end">
        <button
            onClick={handleSell} // Call handleSell directly
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
            Sell
        </button>
    </div>
</Modal>
                {/* User Info and Balance Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-indigo-600">Welcome, {user.name}!</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                    {/* <div className="text-right">
                        <h2 className="text-xl font-semibold text-indigo-600">Balance</h2>
                        <p className="text-3xl font-bold text-pink-600">${user.virtualBalance}</p>
                    </div> */}
                </div>

                {/* Portfolio Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                        <p className="text-lg font-light">Balance</p>
                        <p className="text-2xl font-bold">${user.virtualBalance}</p>
                    </div>
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                        <p className="text-lg font-light">Total Investment</p>
                        <p className="text-2xl font-bold">${totalInvestment.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                        <p className="text-lg font-light">Total Current Value</p>
                        <p className="text-2xl font-bold">${totalCurrentValue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                        <p className="text-lg font-light">Total Gain/Loss</p>
                        <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            ${totalGainLoss.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Portfolio Graph & Pie Chart Side-by-Side */}
                {/* Portfolio Graph and Pie Chart Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-xl font-semibold text-indigo-600 mb-4">Portfolio Performance</h2>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Graph takes 2/3 of the width */}
                        <div className="flex-1">
                            <PortfolioGraph portfolio={portfolio} />
                        </div>

                        {/* Pie chart takes 1/3 of the width */}
                        <div className="w-full md:w-1/3 flex justify-center">
                            <PortfolioPieChart portfolio={portfolio} walletBalance={user.virtualBalance} />
                        </div>
                    </div>
                </div>


                {/* Portfolio Table */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-indigo-600 mb-4">Your Portfolio</h2>
                    {portfolio.length > 0 ? (
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-indigo-600 text-white">
                                    <th className="p-3 text-left">Symbol</th>
                                    <th className="p-3 text-left">Quantity</th>
                                    <th className="p-3 text-left">Purchase Price</th>
                                    <th className="p-3 text-left">Total Value</th>
                                    <th className="p-3 text-left">Current Price</th>
                                    <th className="p-3 text-left">Gain/Loss</th>
                                    <th className="p-3 text-left">Buy/Sell</th>
                                </tr>
                            </thead>
                            <tbody>
                                {portfolio.map((stock, index) => (
                                    <tr key={stock.symbol} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="p-3">{stock.symbol}</td>
                                        <td className="p-3">{stock.quantity}</td>
                                        <td className="p-3">${stock.purchasePrice.toFixed(2)}</td>
                                        <td className="p-3">${(stock.purchasePrice * stock.quantity).toFixed(2)}</td>
                                        <td className="p-3">${stock.currentPrice.toFixed(2)}</td>
                                        <td className={`p-3 ${stock.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${stock.gainLoss}
                                        </td>
                                        {/* <td className="p-3 flex flex-cols gap-2">
                                            <button className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                                Sell
                                            </button>
                                            <button className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                                Buy
                                            </button>
                                        </td> */}

                                        {/* ... (rest of the code remains the same) */}
                                    <td className="p-3 flex flex-cols gap-2">
                                        <button
                                            onClick={() => openSellModal(stock)}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Sell
                                        </button>
                                        <button
                                            onClick={() => openBuyModal(stock)}
                                            className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                        >
                                            Buy
                                        </button>
                                    </td>
{/* ... (rest of the code remains the same) */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-600">No stocks in your portfolio.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
