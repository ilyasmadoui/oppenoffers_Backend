require('dotenv').config({ path: './Config/.env' });
const os = require('os');

if (os.platform() === 'win32') {
    console.log('Detected Windows OS. Starting SQL Server backend...');
    require('./serverSqlServer');

} else {
    console.log('Detected non-Windows OS (Linux/macOS). Starting SQL backend...');
    require('./serverSql');
}