import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  HistoricalPredictionChart, 
  FuturePredictionChart, 
  SentimentChart 
} from './StockChart';

const StockAnalysisPage = () => {
  const [searchParams] = useSearchParams();
  const urlSymbol = searchParams.get('symbol');

  // Prediction state
  const [ticker, setTicker] = useState(urlSymbol || '');
  const [window, setWindow] = useState('1y');
  const [predictionData, setPredictionData] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(!!urlSymbol);
  const [predictionError, setPredictionError] = useState('');

  // Sentiment state
  const [symbol, setSymbol] = useState(urlSymbol || '');
  const [sentimentData, setSentimentData] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(!!urlSymbol);
  const [sentimentError, setSentimentError] = useState('');
  const [expandedSentiment, setExpandedSentiment] = useState(false);
  const [sentimentFilter, setSentimentFilter] = useState('all');

  // Fetch prediction data
  const fetchPrediction = async () => {
    if (!ticker) return;
    
    setPredictionLoading(true);
    setPredictionError('');
    try {
      const response = await axios.post('http://localhost:3000/api/python/predict', {
        ticker,
        window
      });
      setPredictionData(response.data);
    } catch (err) {
      setPredictionError('Failed to fetch prediction data');
      console.error(err);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Fetch sentiment data
  const fetchSentiment = async () => {
    if (!symbol) return;
    
    setSentimentLoading(true);
    setSentimentError('');
    try {
      const response = await axios.post('http://localhost:3000/api/python/getSentiment', { symbol });
      setSentimentData(response.data);
    } catch (err) {
      setSentimentError('Failed to fetch sentiment data');
      console.error(err);
    } finally {
      setSentimentLoading(false);
    }
  };

  // Auto-fetch if coming from profile page
  useEffect(() => {
    if (urlSymbol) {
      fetchPrediction();
      fetchSentiment();
    }
  }, [urlSymbol]);
  const filteredArticles = sentimentData?.articles.filter(article => {
    if (sentimentFilter === 'all') return true;
    return article.sentiment === sentimentFilter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Prediction Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Stock Price Prediction</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Enter stock ticker (e.g., AAPL)"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <select 
              value={window} 
              onChange={(e) => setWindow(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg"
            >
              <option value="30d">30 Days</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
            <button 
              onClick={fetchPrediction} 
              disabled={predictionLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {predictionLoading ? 'Loading...' : 'Predict'}
            </button>
          </div>

          {predictionError && <div className="text-red-500 mb-4">{predictionError}</div>}

          {predictionData ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-600 mb-3">Historical Performance vs Predictions</h3>
                  <div className="h-64">
                    <HistoricalPredictionChart data={predictionData} />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-indigo-600 mb-3">Future Price Predictions</h3>
                  <div className="h-64">
                    <FuturePredictionChart data={predictionData} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-lg font-light">Ticker</p>
                    <p className="text-xl font-bold">{predictionData.metadata.ticker}</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Last Price</p>
                    <p className="text-xl font-bold">${predictionData.future.last_actual_price?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Confidence</p>
                    <p className="text-xl font-bold">{(predictionData.future.confidence * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Next Predicted</p>
                    <p className="text-xl font-bold">${predictionData.future.predicted[0]?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Enter a stock symbol and click "Predict" to see analysis</p>
            </div>
          )}
        </div>

        {/* Sentiment Analysis Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-indigo-600 mb-4">Stock Sentiment Analysis</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="Enter stock symbol"
              className="flex-1 p-2 border border-gray-300 rounded-lg"
            />
            <button 
              onClick={fetchSentiment} 
              disabled={sentimentLoading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sentimentLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>

          {sentimentError && <div className="text-red-500 mb-4">{sentimentError}</div>}

          {sentimentData ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg lg:col-span-1">
                  <h3 className="text-lg font-medium text-indigo-600 mb-3">Sentiment Distribution</h3>
                  <div className="h-64">
                    <SentimentChart data={sentimentData} />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg lg:col-span-2">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium text-indigo-600">News Headlines</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Filter:</span>
                      <select 
                        value={sentimentFilter} 
                        onChange={(e) => setSentimentFilter(e.target.value)}
                        className="p-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="all">All</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                      <button 
                        onClick={() => setExpandedSentiment(!expandedSentiment)}
                        className="text-indigo-600 text-sm hover:underline"
                      >
                        {expandedSentiment ? 'Collapse' : 'Expand All'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredArticles?.map((article, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-lg border ${
                          article.sentiment === 'positive' ? 'bg-green-50 border-green-200' :
                          article.sentiment === 'negative' ? 'bg-red-50 border-red-200' :
                          'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <a 
                          href={article.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-indigo-600 hover:underline"
                        >
                          {article.title}
                        </a>
                        {expandedSentiment && (
                          <p className="mt-2 text-gray-600">{article.summary}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-sm ${
                            article.sentiment === 'positive' ? 'text-green-600' :
                            article.sentiment === 'negative' ? 'text-red-600' :
                            'text-yellow-600'
                          }`}>
                            {article.sentiment}
                          </span>
                          <span className="text-xs text-gray-500">{article.source}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-tr from-indigo-500 to-pink-400 p-6 rounded-lg text-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-lg font-light">Symbol</p>
                    <p className="text-xl font-bold">{sentimentData.symbol}</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Positive</p>
                    <p className="text-xl font-bold">{sentimentData.sentiment_counts.positive}</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Neutral</p>
                    <p className="text-xl font-bold">{sentimentData.sentiment_counts.neutral}</p>
                  </div>
                  <div>
                    <p className="text-lg font-light">Negative</p>
                    <p className="text-xl font-bold">{sentimentData.sentiment_counts.negative}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Enter a stock symbol and click "Analyze" to see sentiment analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysisPage;