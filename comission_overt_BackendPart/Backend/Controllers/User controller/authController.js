const authService = require('../../Services/Users Services/authServices');

module.exports = {

  loginSqlServer: async (req, res) => {
    try {
      const { Email, Password } = req.body;
      console.log('Controller (SQL Server) received:', Email, Password); 
      const user = await authService.loginUserSqlServer(Email, Password); 
      res.json(user);
    } catch (err) {
      console.error('Controller (SQL Server) error:', err.message);      
      res.status(401).json({ error: err.message });
    }
  },

  loginSQL: async (req, res) => {
    try {
      const { Email, Password } = req.body;
      console.log('Controller (SQL) received:', Email, Password);


      const user = await authService.loginUserSQL(Email, Password);


      if (!user || !user.success) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect"
        });
      }


      return res.status(200).json({
        success: true,
        message: "Connexion reussie",
        userId: user.userId
      });


  } catch (err) {
    console.error('Controller (SQL) error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
}

};