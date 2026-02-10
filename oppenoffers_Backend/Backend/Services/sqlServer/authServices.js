const { poolPromise, sql } = require('../../Config/dbSqlServer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');

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
  },

  sendResetPasswordLink: async (email) => {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM dbo.GetAdminByEmail(@email)');

      const admin = result.recordset[0];

      console.log('SQL SERVER RESULT:', admin);

      // Vérifier si l'email existe
      if (!admin) {
        return { success: false, message: 'Email not found.' };
      }

      // Génération du reset token
      const resetToken = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_RESETTOKEN,
        { expiresIn: '10m' }
      );

      const resetLink = `${process.env.FRONT_URL}/reset-password?token=${resetToken}`;
      console.log('RESET LINK:', resetLink);

      // Envoi email
      await sendEmail(
        admin.email,
        'Reset your password',
        `
          <h2>Password Reset</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 10 minutes.</p>
        `
      );

      return {
        success: true,
        message: 'Reset Password email sent successfully.',
        resetLink, 
        admin
      };

    } catch (error) {
      console.error('Auth service error:', error);
      throw error;
    }
  },

  ResetPasswordService: async (adminId, password) => {
    console.log('ResetPasswordService recieved adminID :', adminId , 'Password : ', password);
    try {
      const hashedPassword = hashPassword(password);

      const pool = await poolPromise;
      await pool.request()
        .input('adminId', sql.UniqueIdentifier,adminId)
        .input('hashedPassword', sql.NVarChar(50), hashedPassword)
        .execute('ResetAdminPassword');

      return {
        success: true,
        message: 'Password reset successfully'
      };

    } catch (error) {
      console.error('ResetPasswordService error:', error.message);
      throw error;
    }
  }
};
