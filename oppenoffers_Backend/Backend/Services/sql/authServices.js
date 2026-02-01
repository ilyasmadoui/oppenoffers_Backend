const dbSql = require('../../Config/dbSql');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../../utils/sendEmail');

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
  },

  sendResetPasswordLink: async (email) => {
  try {
    const [rows] = await dbSql.query(
      "SELECT GetAdminByEmail(?) AS data",
      [email]
    );

    const admin = rows[0]?.data ? JSON.parse(rows[0].data) : null;

    console.log('RAW MySQL RESULT:', admin);

    if (!admin || Object.keys(admin).length === 0) {
      return { success: false, message: 'Email not found.' };
    }

    const resetToken = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_RESETTOKEN,
      { expiresIn: '10m' }
    );

    const resetLink = `${process.env.FRONT_URL}/reset-password?token=${resetToken}`;
    console.log('RESET LINK:', resetLink);

    await sendEmail(
      admin.email,
      'Reset your password',
      `
        <h2> Password Reset </h2>
        <p> Click the link below to reset your password: </p>
        <a href="${resetLink}"> ${resetLink} </a>
        <p> this link expires in 10 minutes.</p>
      `
    );

    return {
      success: true,
      message: 'Reset Password email sent successfully.',
      resetLink
    };

  } catch (error) {
    console.error('Auth service error:', error);
    throw error;
  }
},


  ResetPasswordService: async (token, password) => {
    try{
      const decoded = jwt.verify(token, process.env.JWT_RESETTOKEN);
      const hashedPassword = hashPassword(password);
      await dbSql.query('CALL ResetAdminPassword(?, ?)', [decoded.id, hashedPassword]);

      return {success: true, message: 'Password Reset Successfuly'};
    } catch(error) {
      throw error;
    }
  }

};
