const mongoose = require('mongoose');

const connectDB = async () => {
    try {
     const MONGO_URI = process.env.MONGO_URI;
        // console.log(MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = { connectDB };
