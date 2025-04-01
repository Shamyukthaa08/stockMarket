import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";

function Trade() {
    const navigate = useNavigate();
    const [symbol, setSymbol] = useState("");
    const [data, setData] = useState(null);
    const [news, setNews] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");

    const stockSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN"];

    const navigateToAnalysis = (symbol) => {
        navigate(`/stock?symbol=${symbol}`);
    };

    const fetchStockData = async (selectedSymbol) => {
        setSymbol(selectedSymbol);
        try {
            const response = await axios.get(`http://localhost:3000/api/stock/getStock/${selectedSymbol}`);
            setData(response.data);
            fetchNews(selectedSymbol);
        } catch (error) {
            console.error("Error fetching stock data", error);
        }
    };

    const fetchNews = async (symbol) => {
        const NEWS_API_KEY = "e00ccdd4976d4885913078d0078b5468";
        const url = `https://newsapi.org/v2/everything?q=${symbol}&apiKey=${NEWS_API_KEY}`;

        try {
            const response = await axios.get(url);
            setNews(response.data.articles.slice(0, 6));
        } catch (error) {
            console.error("Error fetching news", error);
        }
    };

    const handleBuyStock = async () => {
        if (!symbol || !data || quantity < 1 || quantity > 100) {
            setMessage("Invalid input. Please select a stock and valid quantity (1-100).");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/api/stock/buyStock",
                {
                    symbol,
                    quantity,
                    purchasePrice: data.currentPrice,
                },
                {
                    withCredentials: true,
                }
            );

            setMessage(response.data.message || "Stock purchased successfully!");
        } catch (error) {
            console.error("Error buying stock:", error);
            setMessage("Failed to buy stock. Please try again.");
        }
    };

    useEffect(() => {
        if (symbol) {
            fetchStockData(symbol);
        }
    }, [symbol]);

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="p-8 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-indigo-600 mb-8">Stock Market Simulator</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stock Selection */}
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold text-indigo-600 mb-6">Select a Stock</h2>
                        <select
                            onChange={(e) => fetchStockData(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all mb-4"
                        >
                            <option value="">Select a Stock</option>
                            {stockSymbols.map((sym) => (
                                <option key={sym} value={sym}>{sym}</option>
                            ))}
                        </select>
                        
                        <div className="mb-4">
                            <label htmlFor="quantity" className="block text-gray-700 mb-2">
                                Quantity (1-100):
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                name="quantity"
                                min="1"
                                max="100"
                                value={quantity}
                                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <button
                            onClick={handleBuyStock}
                            className="w-full py-3 rounded-xl bg-violet-600 text-white text-lg font-bold hover:bg-violet-700 transition-colors"
                        >
                            Buy Now
                        </button>

                        {message && (
                            <p className={`mt-4 p-2 rounded ${message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    {/* Stock Data Display */}
                    {data && (
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h1 
                                        className="text-3xl font-bold text-indigo-600 mb-2 cursor-pointer hover:underline"
                                        onClick={() => navigateToAnalysis(data.symbol)}
                                    >
                                        {data.symbol} Stock Data
                                    </h1>
                                    <div className="flex items-center space-x-4 text-gray-600">
                                        <p className="text-lg">{data.name}</p>
                                        <p className="text-lg">•</p>
                                        <p className="text-lg">{data.exchange}</p>
                                        <p className="text-lg">•</p>
                                        <p className="text-lg">{data.country}</p>
                                    </div>
                                    <p className="text-5xl font-bold text-indigo-600 mt-4">
                                        ${data.currentPrice}
                                        <sub className="text-lg text-gray-500 ml-2">{data.currency}</sub>
                                    </p>
                                    <p className={`text-xl font-semibold mt-2 ${parseFloat(data.dailyChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        📊 {data.dailyChange} ({data.dailyChangePercent})
                                    </p>
                                </div>
                                <button
                                    onClick={() => navigateToAnalysis(data.symbol)}
                                    className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
                                >
                                    View Detailed Analysis
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">🟢 <b>Bid Price:</b> ${data.bidPrice}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">🔴 <b>Ask Price:</b> ${data.askPrice}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">📉 <b>P/E Ratio:</b> {data.peRatio}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">💰 <b>EPS:</b> ${data.eps}</p>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">↗️ <b>52-Week High:</b> ${data.high52Week}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">↙️ <b>52-Week Low:</b> ${data.low52Week}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">📊 <b>Volume:</b> {data.volume}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">💹 <b>Dividend Per Share:</b> ${data.dividendPerShare}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-indigo-600 mb-4">Key Metrics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">🔼 <b>Day High:</b> ${data.dayHigh}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                                        <p className="text-gray-600">🔽 <b>Day Low:</b> ${data.dayLow}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* News Section */}
                {data && (
                    <div className="mt-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-bold text-indigo-600">Latest News for {data.symbol}</h2>
                            <button
                                onClick={() => navigateToAnalysis(data.symbol)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                            >
                                Sentiment Analysis
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.map((article, index) => (
                                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                                    <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 via-pink-500 to-indigo-400 inline-block text-transparent bg-clip-text mb-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{article.description}</p>
                                    <a
                                        href={article.url}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:underline"
                                    >
                                        Read more →
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Trade;