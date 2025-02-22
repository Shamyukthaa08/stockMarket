const axios = require('axios');
const User = require('../models/user');
const Transaction = require('../models/transaction');
// const verifyToken = require('../middleware/verifyToken');

// const getStock =  async (req, res) => {
//     try {
//         const symbol = req.params.symbol;

//         const STOCK_API_KEY = process.env.STOCK_API_KEY;
//         console.log(STOCK_API_KEY);

        
//         const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${STOCK_API_KEY}`;

//         const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${STOCK_API_KEY}`;

//         const [quoteResponse, overviewResponse] = await Promise.all([
//             axios.get(quoteUrl),
//             axios.get(overviewUrl)
//         ]);

//         const quoteData = quoteResponse.data["Global Quote"];
//         const overviewData = overviewResponse.data;

//         if (!quoteData || !overviewData) {
//             return res.status(400).json({ error: "Invalid response from Alpha Vantage" });
//         }

//         res.json({
//             symbol,
//             currentPrice: quoteData["05. price"],
//             dailyChange: quoteData["09. change"],
//             dailyChangePercent: quoteData["10. change percent"],
//             bidPrice: quoteData["08. bid price"],  // ✅ Bid Price
//             askPrice: quoteData["07. ask price"],  // ✅ Ask Price
//             high52Week: overviewData["52WeekHigh"],
//             low52Week: overviewData["52WeekLow"],
//             peRatio: overviewData["PERatio"],
//             eps: overviewData["EPS"]
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Error fetching stock data" });
//     }
// }


const getStock = async (req, res) => {
    try {
        const symbol = req.params.symbol;
        if (!symbol) {
            return res.status(400).json({ error: "Stock symbol is required" });
        }

        const STOCK_API_KEY = process.env.STOCK_API_KEY;
        if (!STOCK_API_KEY) {
            return res.status(500).json({ error: "Missing Alpha Vantage API key" });
        }

        console.log(`Fetching stock data for: ${symbol}`);

        const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=MWB3HWX2NR0Y49T5`;
        const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=MWB3HWX2NR0Y49T5`;

        const [quoteResponse, overviewResponse] = await Promise.all([
            axios.get(quoteUrl),
            axios.get(overviewUrl)
        ]);

        console.log("Quote Response:", quoteResponse.data);
        console.log("Overview Response:", overviewResponse.data);

        const quoteData = quoteResponse.data["Global Quote"];
        const overviewData = overviewResponse.data;

        if (!quoteData || Object.keys(quoteData).length === 0) {
            return res.status(400).json({ error: "Invalid stock symbol or Alpha Vantage rate limit exceeded" });
        }

        res.json({
            symbol,
            currentPrice: quoteData["05. price"] || "N/A",
            dailyChange: quoteData["09. change"] || "N/A",
            dailyChangePercent: quoteData["10. change percent"] || "N/A",
            bidPrice: quoteData["08. bid price"] || "N/A",
            askPrice: quoteData["07. ask price"] || "N/A",
            high52Week: overviewData["52WeekHigh"] || "N/A",
            low52Week: overviewData["52WeekLow"] || "N/A",
            peRatio: overviewData["PERatio"] || "N/A",
            eps: overviewData["EPS"] || "N/A",
        });
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        res.status(500).json({ error: "Error fetching stock data" });
    }
};



const getCurrentPrice = async (req, res) => {
    try {
        const { symbol } = req.body;

        // Check if the symbol is provided
        if (!symbol) {
            return res.status(400).json({ error: "Stock symbol is required" });
        }

        // Fetch stock data from Twelve Data API
        const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&apikey=e88c169afaba46fc9ff59ad851bd2419`);

        // Check if the response contains data
        if (!response.data || !response.data.values) {
            return res.status(400).json({ error: "Stock data not found" });
        }

        // Extract the latest stock price
        const latestData = response.data.values[0];
        const currentPrice = latestData.close;

        // Send the current price in the response
        return res.status(200).json({ symbol, currentPrice });

    } catch (err) {
        console.error(err);

        // Handle specific errors
        if (err.response) {
            return res.status(err.response.status).json({ error: "Error fetching stock data from API" });
        } else if (err.request) {
            return res.status(500).json({ error: "No response received from the API" });
        } else {
            return res.status(500).json({ error: "Error fetching stock data" });
        }
    }
};



const myStock = async(req,res)=>{
    const userId = req.userId;
    try{

        const stocks = await Transaction.find({ userId });
        console.log(stocks);

        if(!stocks.length){
            return res.status(404).json({ error: "No stocks found for this user" });
        }
        const balance = await User.findById(userId);
        console.log(balance.virtualBalance);
        
        res.status(200).json({message:"Successfully fetched the items", stocks, balance: balance.virtualBalance});

    }
    catch(error){
        res.status(500).json({error:"Error while fetching items"});

    }
}

const buyStock = async (req, res) => {
    const { symbol, quantity, purchasePrice } = req.body;
    const userId = req.userId;  

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        totalCost = quantity*purchasePrice;

        if (user.virtualBalance < totalCost) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        // Deduct the amount from user's balance
        user.virtualBalance -= totalCost;
        await user.save();

        let transactionStock = await Transaction.findOne({ userId, symbol });

        if (transactionStock) {
            // If user already has this stock, update quantity and total value
            transactionStock.quantity += quantity;
            transactionStock.totalValue += totalCost;
            transactionStock.purchasePrice = (transactionStock.totalValue / transactionStock.quantity).toFixed(2);  // Adjust purchase price
            await transactionStock.save();
        } else {
            // If it's a new stock purchase, create a new transaction entry
            transactionStock = new Transaction({
                userId,
                symbol,
                quantity,
                totalValue : totalCost,
                purchasePrice
            });
            await transactionStock.save();
        }

        res.status(200).json({ message: "Stock purchased successfully", user, transactionStock });
    } catch (error) {
        console.error("Error buying stock:", error);
        res.status(500).json({ error: "Failed to buy stock" });
    }
};


const sellStock = async (req, res) => {
    const { symbol, quantity, price } = req.body;
    const userId = req.userId;  // Get user ID from token middleware

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const transactionStock = await Transaction.findOne({ userId, symbol });

        if (!transactionStock) {
            return res.status(400).json({ error: "You do not own this stock" });
        }

        if (quantity > transactionStock.quantity) {
            return res.status(400).json({ error: "Insufficient shares to sell" });
        }

        const totalRevenue = quantity * price;
        user.virtualBalance += totalRevenue;

        if (quantity < transactionStock.quantity) {
            // Partially sell the stock
            transactionStock.quantity -= quantity;
            transactionStock.totalValue -= quantity * transactionStock.purchasePrice;
            await transactionStock.save();
        } else {
            // If selling all shares, remove the stock entry
            await Transaction.deleteOne({ _id: transactionStock._id });
        }

        await user.save();

        res.status(200).json({ message: "Stock sold successfully", user, remainingShares: transactionStock.quantity });
    } catch (error) {
        console.error("Error selling stock:", error);
        res.status(500).json({ error: "Failed to sell stock" });
    }
};



module.exports =  {
    getStock,
    buyStock,
    sellStock,
    getCurrentPrice,
    myStock
    
}