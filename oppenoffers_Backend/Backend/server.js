require('dotenv').config({ path: './Config/.env' });
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./Routes/sqlServer/authRoutes');
const operationRoutes = require('./Routes/sqlServer/operationRoutes');
const annonceRoutes = require('./Routes/sqlServer/annonceRoutes');
const lotRoutes = require('./Routes/sqlServer/LotRoutes');
const supplierRoutes = require('./Routes/sqlServer/supplierRoutes');
const retraitRoutes = require('./Routes/sqlServer/retraitRoutes');
const comissionMemebersRoutes = require('./Routes/sqlServer/comissionMemeberRoutes');
const evaluationRoutes = require('./Routes/sqlServer/evaluationRoutes');
const adminRoutes = require('./Routes/sqlServer/adminRoutes');
const documentRoutes = require('./Routes/sqlServer/documentRoutes');
const budgetRoutes = require('./Routes/sqlServer/BudgetRoutes');
const path = require('path');
const engagementRoutes = require('./Routes/sqlServer/BudgetRoutes');
const paymentRoutes = require('./Routes/sqlServer/PaymentRoutes');
const apPartitionsRoutes = require('./Routes/sqlServer/ApPartitionsRoutes');
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// PDF render requests can be larger (operations + suppliers + evaluations)
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/opr', operationRoutes);
app.use('/api/ann', annonceRoutes);
app.use('/api/lot', lotRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/retrait', retraitRoutes);
app.use('/api/cm', comissionMemebersRoutes);
app.use('/api/eval', evaluationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/doc', documentRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/apPartitions', apPartitionsRoutes);


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
