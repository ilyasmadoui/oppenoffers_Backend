const authService = require('../../Services/sqlServer/authServices');

const decodeEmail = (email, isObfuscated) => {
  if (!isObfuscated) return email;
  try {
    return decodeURIComponent(Buffer.from(email, 'base64').toString('ascii'));
  } catch (error) {
    throw new Error('Invalid email encoding');
  }
};

module.exports = {
  login: async (req, res) => {
    try {
      let { Email, Password, obfuscated } = req.body;

      // Decode email if it was obfuscated
      const decodedEmail = decodeEmail(Email, obfuscated);

      console.log('Login attempt for:', decodedEmail);

      // Password is already hashed from frontend, pass through as-is
      const result = await authService.loginUserSqlServer(decodedEmail, Password);

      const { userId, token, role } = result;
      res.json({ userId, token, role });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(401).json({ error: err.message });
    }
  },

  forgotPassword: async (req, res) => {
    const { Email } = req.body;
    console.log('forgotPassword Controller - Email:', Email);
    try {
      const result = await authService.sendResetPasswordLink(Email);

      if (!result.success) {
        return res.status(401).json({
          message: result.message
        });
      }

      return res.status(200).json({
        message: result.message,
        adminData: result.admin
      });

    } catch (error) {
      console.error('ForgotPassword error:', error);

      return res.status(500).json({
        message: error.message || 'Internal server error.'
      });
    }
  },

  resetPassword: async (req, res) => {
    const { adminId, password } = req.body;
    console.log('ResetPassword Controller - adminId:', adminId);

    try {
      const result = await authService.ResetPasswordService(adminId, password);

      if (!result.success) {
        return res.status(401).json({
          message: result.message
        });
      }

      return res.status(200).json({
        message: result.message
      });

    } catch (error) {
      console.error('ResetPassword error:', error);

      return res.status(401).json({
        message: error.message || 'Token invalide ou expiré'
      });
    }
  }
};