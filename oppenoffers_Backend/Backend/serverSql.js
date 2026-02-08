require('dotenv').config({ path: './Config/.env' });
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');


const authRoutes = require('./Routes/sql/authRoutes');
const operationRoutes = require('./Routes/sql/operationRoutes');
const annonceRoutes = require('./Routes/sql/annonceRoutes');
const lotRoutes = require('./Routes/sql/LotRoutes');
const supplierRoutes = require('./Routes/sql/supplierRoutes');
const retraitRoutes = require('./Routes/sql/retraitRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// SQL Routes
app.use('/api/auth', authRoutes);
app.use('/api/opr', authMiddleware, operationRoutes);
app.use('/api/ann', authMiddleware, annonceRoutes);
app.use('/api/lot', authMiddleware, lotRoutes);
app.use('/api/supplier', authMiddleware, supplierRoutes);
app.use('/api/retrait', retraitRoutes);



app.get('/api/health', (req, res) => {
    res.json({ status: 'SQL is running!' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal SQL server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SQL server running on port ${PORT}`);
});
