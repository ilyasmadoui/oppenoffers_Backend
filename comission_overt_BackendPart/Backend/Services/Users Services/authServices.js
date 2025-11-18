const { poolPromise, sql } = require('../../Config/dbSqlServer');
const dbSql = require('../../Config/dbSql');

module.exports = {
  /*loginUserSqlServer: async (email, password) => {
    try {
      console.log('Service received:', email, password);
      const pool = await poolPromise;
      const result = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .input('password', sql.NVarChar(50), password)
        .execute('loginUser');
      console.log('(Service) SQL result:', result.recordset); 

      if (!result.recordset[0]) {
        throw new Error('Invalid credentials');
      }
      const userId = result.recordset[0].userId;

      return {
        success: true,
        userId: userId,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Auth service error:', error.message);
      throw error;
    }
  },*/

  loginUserSQL: async (email, password) => {
    try {
    const [result] = await dbSql.query("CALL loginUserSQL(?, ?)", [email, password]);
    console.log(" RAW MySQL RESULT:", JSON.stringify(result, null, 2));


    const rows = result[0];


    if (!rows || rows.length === 0) {
      return {
        success: false,
        message: "Email ou mot de passe incorrect"
      };
    }


    return {
      success: true,
      message: "Connexion réussie",
      userId: rows[0].userId
    };


    } catch (error) {
      console.error("Auth service error:", error);
      throw error;
    }
  }
};
