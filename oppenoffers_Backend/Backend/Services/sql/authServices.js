const dbSql = require('../../Config/dbSql');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex').slice(0, 50);
}

module.exports = {
  login: async (email, password) => {
    try {
      const hashedPassword = hashPassword(password);
      const [result] = await dbSql.query("CALL loginUserSQL(?, ?)", [email, hashedPassword]);
      console.log(" RAW MySQL RESULT:", JSON.stringify(result, null, 2));

      const rows = result[0];

      if (!rows || rows.length === 0) {
        return {
          success: false,
          message: "Email ou mot de passe incorrect"
        };
      }
      
      const userId = rows[0].userId;

      const token = jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );


      return {
        success: true,
        message: "Connexion réussie",
        userId: rows[0].userId,
        token : token
      };

    } catch (error) {
      console.error("Auth service error:", error);
      throw error;
    }
  }
};
