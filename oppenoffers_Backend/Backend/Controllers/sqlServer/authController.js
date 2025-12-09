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
}