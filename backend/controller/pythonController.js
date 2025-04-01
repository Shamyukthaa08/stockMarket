const axios = require('axios');

const PYTHON_API_URL = 'http://127.0.0.1:5000';

const getSentiment = async (req, res) => {
  try {
    const { symbol } = req.body;
    const response = await axios.post(`${PYTHON_API_URL}/analyze-news`, { symbol });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze news' });
  }
};

const getStockPrediction = async (req, res) => {
  try {
    const { ticker, window } = req.body;
    
    // Call Flask prediction endpoint
    const response = await axios.post(`${PYTHON_API_URL}/predict`, {
      ticker,
      window: window || '1y' // default to 1 year
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Failed to get stock prediction' });
  }
}

module.exports = { getSentiment, getStockPrediction };
