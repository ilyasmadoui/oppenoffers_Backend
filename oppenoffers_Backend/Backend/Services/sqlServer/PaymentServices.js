const { sql, poolPromise } = require('../../Config/dbSqlServer');
const { toDateOrNull } = require('../../Helper');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePaymentPDF(payment) {
    const folderPath = path.join(__dirname, '../../uploads/fiche_Paye_PDF');
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const templatePath = path.join(__dirname, '../../templates/fiche_paye.html');
    let htmlContent = fs.readFileSync(templatePath, 'utf8');

    const dateObj = payment.date ? new Date(payment.date) : new Date();
    const monthYear = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const monthYearUpper = monthYear.toUpperCase();

    htmlContent = htmlContent
        .replace('{{reference}}', payment.reference || '')
        .replace('{{date}}', payment.date ? new Date(payment.date).toLocaleDateString('fr-FR') : '')
        .replace('{{amount}}', payment.amount || '')
        .replace('{{type}}', payment.type || '')
        .replace('{{monthYear}}', monthYear)
        .replace('{{monthYearUpper}}', monthYearUpper);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const filePath = path.join(folderPath, `payment_${payment.paymentId}.pdf`);
    await page.pdf({ path: filePath, format: 'A4' });

    await browser.close();
    return filePath;
}

module.exports = {
    getAllPayments: async () => {
        try {
            const pool = await poolPromise;
            const result = await pool.request().query(`
                SELECT PaymentID, EngagementID, Date, CreatedAt, CreatedBy, Status, e.Type, e.Referece 
                FROM PAYMENT
                JOIN ENGAGEMENT e ON e.EngagementID = PAYMENT.EngagementID `);

            return {
                success: true,
                data: result.recordset,
            };
        } catch (error) {
            console.error("Payment service error:", error);
            return {
                success: false,
                message: "Database error occurred.",
                error: error.message,
            };
        }
    },
    updatePayment: async (paymentId, date) => {
        try {
            const pool = await poolPromise;

            await pool.request()
                .input('paymentId', sql.UniqueIdentifier, paymentId)
                .input('date', sql.Date, toDateOrNull(date))
                .query("UPDATE PAYMENT SET Date = @date, Status = 2 WHERE PaymentID = @paymentId");

            return {
                success: true,
                message: "Payment updated successfully.",
            };
        } catch (error) {
            console.error("Payment service error:", error);
            return {
                success: false,
                message: "Database error occurred.",
                error: error.message,
            };
        }
    },
    generatePaymentPDFById: async (paymentId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('paymentId', sql.UniqueIdentifier, paymentId)
                .query(`
                    SELECT 
                        p.PaymentID AS paymentId,
                        p.Date AS paymentDate,
                        e.Referece AS reference,
                        e.Amount AS amount,
                        e.Type AS engagementType,
                        e.Reason AS reason
                    FROM PAYMENT p
                    JOIN ENGAGEMENT e ON e.EngagementID = p.EngagementID
                    WHERE p.PaymentID = @paymentId
                `);

            const row = result.recordset?.[0];
            if (!row) {
                return {
                    success: false,
                    code: 404,
                    message: "Payment not found.",
                };
            }

            const pdfPath = await generatePaymentPDF({
                paymentId: row.paymentId,
                reference: row.reference,
                date: row.paymentDate,
                amount: row.amount,
                type: Number(row.engagementType) === 1 ? 'DEBIT' : 'CREDIT',
                reason: row.reason || ''
            });

            return {
                success: true,
                pdfPath,
                paymentId: row.paymentId,
            };
        } catch (error) {
            console.error("generatePaymentPDFById error:", error);
            return {
                success: false,
                code: 5000,
                message: "Failed to generate payment PDF.",
                error: error.message,
            };
        }
    },
};