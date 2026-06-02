const { v4: uuidv4 } = require('uuid');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const REQUIRED_FIELDS_CREATE = [
  "Id_Operation",
  "Numero",
  "Date_Publication",
  "Journal",
  "Delai",
  "Date_Overture",
  "adminId",
];

const generateIDS = () => {
  return uuidv4();
};

const generatePDF = async (engagement) => {
  const folderPath = path.join(__dirname, './uploads/fiche_Paye_PDF');
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const templatePath = path.join(__dirname, './templates/fiche_paye.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Date de Rapport
  const dateObj = new Date(engagement.date);
  const monthYear = isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const monthYearUpper = monthYear.toUpperCase();

  htmlContent = htmlContent
    .replace('{{reference}}', engagement.reference || '')
    .replace('{{date}}', engagement.date || '')
    .replace('{{amount}}', engagement.amount || '')
    .replace('{{type}}', engagement.type || '')
    .replace('{{reason}}', engagement.reason || '')
    .replace('{{Description}}', engagement.Description || '')
    .replace('{{monthYear}}', monthYear)
    .replace('{{monthYearUpper}}', monthYearUpper);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  const filePath = path.join(folderPath, `fiche_${engagement.engagementID}.pdf`);
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();

  return filePath;
}

const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  // Return only the date part: YYYY-MM-DD
  return parsed.toISOString().split('T')[0];
};

const toTimeOrNull = (timeValue) => {
  if (!timeValue) return null;

  // If it's already a Date object, return it
  if (timeValue instanceof Date) return timeValue;

  // Handle string formats like "14:54" or "14:54:00"
  if (typeof timeValue === 'string') {
    // Split the time string
    let parts = timeValue.split(':');

    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

      // Create a Date object with today's date but the specified time
      // This is what tedious expects for TIME parameters
      const date = new Date();
      date.setHours(hours, minutes, seconds, 0);
      return date;
    }
  }

  return null;
};

const convertTimeToDate = (timeStr) => {
  if (!timeStr) return null;
  if (timeStr instanceof Date) return timeStr;

  const [hours, minutes, seconds = '00'] = timeStr.split(':');

  return new Date(Date.UTC(
    1970, 0, 1,
    parseInt(hours, 10),
    parseInt(minutes, 10),
    parseInt(seconds, 10)
  ));
};

const toDateTimeOrNull = (datetime) => {
  if (!datetime) return null;
  const date = new Date(datetime);
  return isNaN(date.getTime()) ? null : date;
};

module.exports = {
  REQUIRED_FIELDS_CREATE,
  generateIDS,
  toDateOrNull,
  toTimeOrNull,
  toDateTimeOrNull,
  convertTimeToDate,
  generatePDF
};