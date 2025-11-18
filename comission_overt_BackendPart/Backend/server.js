require('dotenv').config({path : './Config/.env'});
const express = require('express');
const cors = require('cors');
const authRoutes = require('./Routes/authRoutes');
const operationRoutes = require('./Routes/operationRoutes');
const annonceRoutes = require('./Routes/annonceRoutes');
const lotRoutes = require('./Routes/LotRoutes');

const app = express();


app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/opr', operationRoutes);
app.use('/api/ann', annonceRoutes );
app.use('/api/lot', lotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

