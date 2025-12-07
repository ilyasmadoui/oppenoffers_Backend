require('dotenv').config({ path: './Config/.env' });
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./Routes/sqlServer/authRoutes');
const operationRoutes = require('./Routes/sqlServer/operationRoutes');
const annonceRoutes = require('./Routes/sqlServer/annonceRoutes');
const lotRoutes = require('./Routes/sqlServer/LotRoutes');
const supplierRoutes = require('./Routes/sqlServer/supplierRoutes');

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/opr', operationRoutes);
app.use('/api/ann', annonceRoutes);
app.use('/api/lot', lotRoutes);
app.use('/api/supplier', supplierRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'SQL Server is running!' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal SQL Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`SQL Server running on port ${PORT}`);
});
