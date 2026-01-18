const { poolPromise, sql } = require('../../Config/dbSqlServer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
function hashPassword(password) {

  return crypto.createHash('sha256').update(password).digest('hex').slice(0, 50);
}

module.exports = {
  loginUserSqlServer: async (email, password) => {
    try {
     
      console.log('Service received:', email, '[password hidden]');
      const hashedPassword = hashPassword(password);
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .input('password', sql.NVarChar(50), hashedPassword)
        .execute('loginUser');
      console.log('(Service) SQL result:', result.recordset); 

      if (!result.recordset[0]) {
        throw new Error('Invalid credentials');
      }
      const userId = result.recordset[0].userId;

      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      return {
        success: true,
        userId: userId,
        token: token,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Auth service error:', error.message);
      throw error;
    }
  }
};
