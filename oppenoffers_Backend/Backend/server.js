require('dotenv').config({ path: './Config/.env' });
const os = require('os');

if (os.platform() === 'win32') {
    console.log('Detected non-Windows OS (Linux/macOS). Starting SQL backend...');
    require('./serverSql');
} else {
	 console.log('Detected Windows OS. Starting SQL Server backend...');
    require('./serverSqlServer');
}