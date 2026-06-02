const { poolPromise, sql } = require('../../Config/dbSqlServer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');
const generateResetPasswordEmail = require("../../utils/emailTemplates/resetPasswordTemplate");

// This function is now only used for generating new passwords during reset
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex').slice(0, 50);
}

module.exports = {
  loginUserSqlServer: async (email, password) => {
    try {
      // password is already hashed from frontend
      const hashedPassword = password;

      const pool = await poolPromise;

      const result = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .input('password', sql.NVarChar(50), hashedPassword)
        .execute('loginUser');

      const user = result.recordset[0];

      // ❌ Email ou password incorrect
      if (!user) {
        throw new Error('INVALID_CREDENTIALS');
      }

      // ❌ Compte désactivé
      if (user.state === 0) {
        throw new Error('ACCOUNT_DISABLED');
      }

      // ✅ Login OK
      const token = jwt.sign(
        { userId: user.userId, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      return {
        userId: user.userId,
        token,
        role: user.role
      };

    } catch (error) {
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

      // Génération d'un nouveau mot de passe aléatoire
      const newPassword = crypto.randomBytes(12).toString('base64').slice(0, 16);
      const hashedPassword = hashPassword(newPassword);

      // Mise à jour du mot de passe dans la base de données
      await pool.request()
        .input('adminId', sql.UniqueIdentifier, admin.id)
        .input('hashedPassword', sql.NVarChar(50), hashedPassword)
        .execute('ResetAdminPassword');

      console.log('Password updated for admin:', admin.email);

      const emailHtml = generateResetPasswordEmail(newPassword);

      // Envoi email avec le nouveau mot de passe
      await sendEmail(
        admin.email,
        'Your new password',
        emailHtml
      );

      return {
        success: true,
        message: 'New password generated and sent to your email successfully.',
        admin
      };

    } catch (error) {
      console.error('Auth service error:', error);
      throw error;
    }
  },

  ResetPasswordService: async (adminId, password) => {
    console.log('ResetPasswordService received adminId:', adminId);
    try {
      const hashedPassword = hashPassword(password);

      const pool = await poolPromise;
      await pool.request()
        .input('adminId', sql.UniqueIdentifier, adminId)
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