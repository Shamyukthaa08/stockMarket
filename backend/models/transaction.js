const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    // name: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    // currentPrice: { type: Number, required: true, default: 0 },
    // totalGainLoss: { type: Number, required: true, default: 0 },
    // todaysChange: { type: Number, required: true, default: 0 },
    totalValue: {type:Number , required:true},
    purchaseDate: { type: Date, default: Date.now }
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
