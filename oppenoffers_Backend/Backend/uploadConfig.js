const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(process.cwd(), 'uploads/Fiches_Engagements');
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },

    filename: function (req, file, cb) {
        const dest = path.join(process.cwd(), 'uploads/Fiches_Engagements');
        let baseName = `engagement_${req.params.engagementId}`;
        let fileName = `${baseName}.pdf`;
        let counter = 1;

        while (fs.existsSync(path.join(dest, fileName))) {
            fileName = `${baseName}(${counter}).pdf`;
            counter++;
        }

        cb(null, fileName);
    }
});

const storagePayment = multer.diskStorage({
    destination: function (req, file, cb) {
        const dest = path.join(process.cwd(), 'uploads/Fiches_Payments');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        const dest = path.join(process.cwd(), 'uploads/Fiches_Payments');
        let baseName = `payment_${req.params.paymentId}`;
        let fileName = `${baseName}.pdf`;
        let counter = 1;

        while (fs.existsSync(path.join(dest, fileName))) {
            fileName = `${baseName}(${counter}).pdf`;
            counter++;
        }

        cb(null, fileName);
    }
});

const uploadEngPDF = multer({ storage });
const uploadPaymentPDF = multer({ storage: storagePayment });

module.exports = {
    uploadEngPDF,
    uploadPaymentPDF
};