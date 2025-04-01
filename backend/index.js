const express = require('express');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./models/config');
const authRoutes = require('./routes/auth');
const stockRoute = require('./routes/stockRoute');
const pythonRoute = require('./routes/pythonRoute');
const cors = require('cors');


require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true, 
  }));
app.use(cookieParser());


app.use('/api/auth',authRoutes);
app.use('/api/stock',stockRoute);
app.use('/api/python',pythonRoute);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});

