const authService = require('../../Services/sql/authServices');

const login = async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const result = await authService.login(Email, Password);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        res.json({
            token: result.token,
            userId: result.userId,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error." });
    }
};

const ForgotPassword = async (req, res) => {
  const { Email } = req.body;

  try {
    const result = await authService.sendResetPasswordLink(Email);

    if (!result.success) {
      return res.status(401).json({
        message: result.message
      });
    }

    return res.status(200).json({
      message: result.message,
      resetLink: result.resetLink
    });

  } catch (error) {
    console.error('ForgotPassword error:', error);

    return res.status(500).json({
      message: error.message || 'Internal server error.'
    });
  }
};

const ResetPassword = async (req, res) => {
  const { token, password  } = req.body;

  try {
    const result = await authService.ResetPasswordService(token, password );

    if (!result.success) {
      return res.status(401).json({
        message: result.message
      });
    }

    return res.status(200).json({
      message: result.message,
      resetLink: result.resetLink
    });

  } catch (error) {
    console.error('ForgotPassword error:', error);

    return res.status(401).json({ 
      message: error.message || 'Token invalide ou expiré'
    });
  }
};

module.exports = {
    login,
    ForgotPassword,
    ResetPassword
};