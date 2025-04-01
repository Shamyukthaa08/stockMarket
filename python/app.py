from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BertTokenizer, BertForSequenceClassification
import torch
import requests
from stock_utils import get_stock_data, prepare_data, get_time_based_predictions
from keras.models import load_model
import numpy as np



app = Flask(__name__)
CORS(app)

# Load FinBERT model
tokenizer = BertTokenizer.from_pretrained('yiyanghkust/finbert-tone')
model = BertForSequenceClassification.from_pretrained('yiyanghkust/finbert-tone')
stock_model = load_model('model/stock_predictor.h5')


def analyze_sentiment(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = model(**inputs)
    predicted_class = torch.argmax(outputs.logits, dim=1).item()
    return ["negative", "neutral", "positive"][predicted_class]

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data.get('text')
    if not text:
        return jsonify({"error": "No text provided"}), 400
    
    sentiment = analyze_sentiment(text)
    return jsonify({"text": text, "sentiment": sentiment})

@app.route('/analyze-news', methods=['POST'])
def analyze_news():
    symbol = request.json.get('symbol')
    if not symbol:
        return jsonify({"error": "No stock symbol provided"}), 400
    
    # Fetch news from NewsAPI
    NEWS_API_KEY = "956474a5c31c4757b543b5a42628f055"
    url = f"https://newsapi.org/v2/everything?q={symbol}&apiKey={NEWS_API_KEY}"
    response = requests.get(url)
    articles = response.json().get('articles', [])[:10]  # Get top 10 articles
    
    # Analyze each article
    results = []
    for article in articles:
        title = article.get('title', '')
        if title:
            sentiment = analyze_sentiment(title)
            results.append({
                "title": title,
                "sentiment": sentiment,
                "url": article.get('url', '')
            })
    
    # Calculate overall sentiment
    sentiment_counts = {
        "positive": sum(1 for r in results if r["sentiment"] == "positive"),
        "neutral": sum(1 for r in results if r["sentiment"] == "neutral"),
        "negative": sum(1 for r in results if r["sentiment"] == "negative")
    }
    
    return jsonify({
        "symbol": symbol,
        "articles": results,
        "sentiment_counts": sentiment_counts
    })
@app.route('/predict-stock', methods=['POST'])
def predict_stock():
    try:
        data = request.json
        ticker = data.get('ticker')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not all([ticker, start_date, end_date]):
            return jsonify({"error": "Missing parameters"}), 400
        
        df = get_stock_data(ticker, start_date, end_date)
        y_test, y_predicted, _ = prepare_data(df)
        
        return jsonify({
            "actual_prices": y_test.tolist(),
            "predicted_prices": y_predicted.flatten().tolist(),
            "dates": df.index.strftime('%Y-%m-%d').tolist()
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        result = get_time_based_predictions(
            ticker=data['ticker'],
            prediction_window=data.get('window', '1y')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)

    #pip install flask flask-cors transformers torch requests