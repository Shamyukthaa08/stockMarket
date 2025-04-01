import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from keras.models import load_model
import time
from datetime import datetime, timedelta


def get_stock_data(ticker, start_date, end_date, max_retries=3):
    """Robust stock data downloader with error handling"""
    for attempt in range(max_retries):
        try:
            df = yf.download(ticker, start=start_date, end=end_date, auto_adjust=False, progress=False)
            
            if df.empty:
                raise ValueError(f"No data for {ticker}")
            
            # Standardize column names
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = ['_'.join(col).lower().strip() for col in df.columns]
            else:
                df.columns = [str(col).lower().strip() for col in df.columns]
            
            # Ensure close price exists
            close_col = next((col for col in df.columns if 'close' in col), None)
            if not close_col:
                raise ValueError("No closing price column found")
                
            df = df.rename(columns={close_col: 'Close'})
            return df.drop([col for col in df.columns if 'adj' in col], axis=1)
            
        except Exception as e:
            print(f"Attempt {attempt+1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise
            time.sleep(2)

def prepare_data(df):
    """Prepare data for LSTM model"""
    if not isinstance(df, pd.DataFrame):
        raise TypeError(f"Expected DataFrame, got {type(df)}")
    
    if len(df) < 100:
        raise ValueError("Insufficient data (need at least 100 days)")
    
    # Split data (70% train, 30% test)
    split_idx = int(len(df) * 0.70)
    data_training = pd.DataFrame(df['Close'].iloc[:split_idx])
    data_testing = pd.DataFrame(df['Close'].iloc[split_idx:])
    
    # Scale data
    scaler = MinMaxScaler(feature_range=(0,1))
    data_training_array = scaler.fit_transform(data_training)
    
    # Create sequences (100-day windows)
    x_train, y_train = [], []
    for i in range(100, len(data_training_array)):
        x_train.append(data_training_array[i-100:i])
        y_train.append(data_training_array[i, 0])
    
    # Prepare test data
    past_100_days = data_training.iloc[-100:]
    final_df = pd.concat([past_100_days, data_testing])
    input_data = scaler.transform(final_df[['Close']])
    
    x_test = []
    for i in range(100, len(input_data)):
        x_test.append(input_data[i-100:i, 0])
    
    # Convert to numpy arrays
    x_train = np.array(x_train)
    y_train = np.array(y_train)
    x_test = np.array(x_test)
    x_test = np.reshape(x_test, (x_test.shape[0], x_test.shape[1], 1))
    
    # Get actual prices
    y_test = final_df['Close'].iloc[100:].values
    
    return y_test, x_test, scaler, df

def predict_stock_prices(model, x_test, scaler):
    """Make predictions on test data"""
    try:
        y_predicted = model.predict(x_test)
        y_predicted = scaler.inverse_transform(y_predicted.reshape(-1, 1))
        return y_predicted.flatten()
    except Exception as e:
        raise ValueError(f"Prediction failed: {str(e)}")

def predict_future(model, last_100_days, scaler, future_days):
    """Predict future prices"""
    future_predictions = []
    current_sequence = last_100_days.copy()
    
    for _ in range(future_days):
        x = current_sequence[-100:].reshape(1, 100, 1)
        pred = model.predict(x, verbose=0)[0][0]
        future_predictions.append(pred)
        current_sequence = np.append(current_sequence, pred)
    
    return scaler.inverse_transform(
        np.array(future_predictions).reshape(-1, 1)
    ).flatten()

def get_time_based_predictions(ticker, prediction_window='1y'):
    """Main prediction function with 5-year lookback"""
    # Set date ranges (5 years back -> today)
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=5*365)).strftime('%Y-%m-%d')
    
    # Convert prediction window to days
    window_map = {
        '30d': 30,
        '3m': 90,
        '6m': 180,
        '1y': 365
    }
    future_days = window_map.get(prediction_window, 30)
    
    # Get and prepare data
    df = get_stock_data(ticker, start_date, end_date)
    y_test, x_test, scaler, df = prepare_data(df)
    
    # Load model and make predictions
    model = load_model('model/stock_predictor.h5')
    
    # Historical predictions
    historical_pred = predict_stock_prices(model, x_test, scaler)
    
    # Future predictions
    scaled_data = scaler.transform(df[['Close']].values)
    last_100_days = scaled_data[-100:].flatten()
    future_pred = predict_future(model, last_100_days, scaler, future_days)
    
    # Generate business day dates
    business_days = pd.date_range(
        start=end_date,
        periods=future_days,
        freq='B'
    ).strftime('%Y-%m-%d').tolist()
    
    return {
        "historical": {
            "actual": y_test.tolist(),
            "predicted": historical_pred.tolist(),
            "dates": df.index[-len(y_test):].strftime('%Y-%m-%d').tolist()
        },
        "future": {
            "predicted": future_pred.tolist(),
            "dates": business_days,
            "last_actual_price": float(df['Close'].iloc[-1]),
            "confidence": max(0.3, 0.85 - (0.15 * (future_days / 30)))  # Confidence score
        },
        "metadata": {
            "ticker": ticker,
            "training_range": f"{start_date} to {end_date}",
            "prediction_window": prediction_window
        }
    }