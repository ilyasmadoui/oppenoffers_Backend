const authService = require('../../Services/sqlServer/authServices');

module.exports = {
  login: async (req, res) => {
    try {
      const { Email, Password } = req.body;
      console.log('Controller (SQL Server) received:', Email, '[password hidden]');
      const result = await authService.loginUserSqlServer(Email, Password); 
      const { userId, token} = result;
      res.json({ userId, token});
    } catch (err) {
      console.error('Controller (SQL Server) error:', err.message);
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
        resetLink: result.resetLink,
        adminData:result.admin
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
    console.log('ResetPassword Controller - adminId:', adminId, ', password:', password);

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
}