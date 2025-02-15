import React, { useState, useEffect } from "react";
import axios from "axios";

const Stock = () => {
    const [symbol, setSymbol] = useState("");
    const [data, setData] = useState(null);
    const [quantity, setQuantity] = useState(1); // State for quantity selection
    const [message, setMessage] = useState(""); // State for success/error messages
    const [portfolio, setPortfolio] = useState([]); // State for user's stock portfolio
    const [balance, setBalance] = useState(0); // State for user's virtual balance

    const stockSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"]; // Example stock symbols

    // Fetch stock data for the selected symbol
    const fetchStockData = async (selectedSymbol) => {
        setSymbol(selectedSymbol);
        try {
            const response = await axios.get(`http://localhost:3000/api/stock/getStock/${selectedSymbol}`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching stock data", error);
        }
    };

    // Fetch user's stock portfolio and balance
    const fetchPortfolio = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/stock/myStock", {
                withCredentials: true, // Include cookies for authentication
            });

            if (response.data.stocks) {
                setPortfolio(response.data.stocks); // Set user's stock portfolio
                setBalance(response.data.balance); // Set user's virtual balance
            }
        } catch (error) {
            console.error("Error fetching portfolio:", error);
            setMessage("Failed to fetch portfolio. Please try again.");
        }
    };

    // Handle buying stock
    const handleBuyStock = async () => {
        if (!symbol || !data || quantity < 1 || quantity > 100) {
            setMessage("Invalid input. Please select a stock and a valid quantity (1-100).");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/api/stock/buyStock",
                {
                    symbol,
                    quantity,
                    purchasePrice: data.currentPrice, // Use the current price from the fetched data
                },
                {
                    withCredentials: true, // Include cookies for authentication
                }
            );

            if (response.data.message) {
                setMessage(response.data.message); // Display success message
                fetchPortfolio(); // Refresh portfolio after buying stock
            } else {
                setMessage("Stock purchased successfully!");
            }
        } catch (error) {
            console.error("Error buying stock:", error);
            setMessage("Failed to buy stock. Please try again.");
        }
    };

    // Fetch portfolio when the component mounts
    useEffect(() => {
        fetchPortfolio();
    }, []);

    // Fetch stock data when the symbol changes
    useEffect(() => {
        if (symbol) {
            fetchStockData(symbol);
        }
    }, [symbol]);

    return (
        <div>
            <h1>Stock Market Simulator</h1>

            {/* Stock Selection and Data Display */}
            <select onChange={(e) => fetchStockData(e.target.value)}>
                <option value="">Select a Stock</option>
                {stockSymbols.map((sym) => (
                    <option key={sym} value={sym}>{sym}</option>
                ))}
            </select>

            {data && (
                <div>
                    <h2>{data.symbol} Stock Data</h2>
                    <p>📈 <b>Current Price:</b> ${data.currentPrice}</p>
                    <p>📊 <b>Daily Change:</b> {data.dailyChange} ({data.dailyChangePercent})</p>
                    <p>🟢 <b>Bid Price:</b> ${data.bidPrice}</p>
                    <p>🔴 <b>Ask Price:</b> ${data.askPrice}</p>
                    <p>🔼 <b>52-Week High:</b> ${data.high52Week}</p>
                    <p>🔽 <b>52-Week Low:</b> ${data.low52Week}</p>
                    <p>📉 <b>P/E Ratio:</b> {data.peRatio}</p>
                    <p>💰 <b>EPS:</b> ${data.eps}</p>
                </div>
            )}

            {/* Quantity Selection and Buy Button */}
            <div>
                <label htmlFor="quantity">Quantity (1-100):</label>
                <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max="100"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="bg-violet-200 rounded border-black"
                />
            </div>

            <div>
                <button
                    onClick={handleBuyStock}
                    className="active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] ease-in-out py-3 rounded-xl bg-violet-600 text-white text-lg font-bold px-10"
                >
                    Buy Now
                </button>
            </div>

            {/* Display Messages */}
            {message && <p>{message}</p>}

            {/* User's Stock Portfolio */}
            <div>
                <h2>Your Portfolio</h2>
                <p>💰 <b>Virtual Balance:</b> ${balance}</p>
                {portfolio.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Quantity</th>
                                <th>Purchase Price</th>
                                <th>Total Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {portfolio.map((stock, index) => (
                                <tr key={index}>
                                    <td>{stock.symbol}</td>
                                    <td>{stock.quantity}</td>
                                    <td>${stock.purchasePrice}</td>
                                    <td>${stock.totalValue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No stocks in your portfolio.</p>
                )}
            </div>
        </div>
    );
};

export default Stock;