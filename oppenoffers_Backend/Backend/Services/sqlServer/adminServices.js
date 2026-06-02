const { poolPromise, sql } = require("../../Config/dbSqlServer");
const crypto = require("crypto");
const { generateIDS } = require("../../Helper");
const sendEmail = require("../../utils/sendEmail");

// ====== Requêtes SQL déclarées en début de page ======
const QUERY_GET_ALL_ADMINS = `
  SELECT id, email, role, state, nom_prenom, [function]
  FROM ADMINS
  WHERE role <> 2
  ORDER BY id DESC
`;

const QUERY_INSERT_ADMIN = `
  INSERT INTO ADMINS (id, email, password, role, state, nom_prenom, [function])
  VALUES (@id, @email, @password, 1, 1, @nom_prenom, @function);

  SELECT id, email, role, state, nom_prenom, [function]
  FROM ADMINS
  WHERE id = @id;
`;

const QUERY_UPDATE_ADMIN_STATE = `
  UPDATE ADMINS
  SET state = @state
  WHERE id = @id;

  SELECT id, email, role, state, nom_prenom, [function]
  FROM ADMINS
  WHERE id = @id;
`;

const QUERY_DELETE_ADMIN = `
  DELETE FROM ADMINS
  WHERE id = @id;
`;

function hashPassword(password) {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex")
    .slice(0, 50);
}

module.exports = {
  // 🔹 Get all admins
  getAllAdmins: async () => {
    try {
      const pool = await poolPromise;

      const result = await pool.request().query(QUERY_GET_ALL_ADMINS);

      return {
        success: true,
        admins: result.recordset || [],
      };
    } catch (error) {
      console.error("Admin service error (getAllAdmins):", error);
      return {
        success: false,
        message: "Database error while fetching admins.",
      };
    }
  },

  //  Create admin
  createAdmin: async (data) => {
    const { email, password, nom_prenom, function: adminFunction } = data;

    try {
      const pool = await poolPromise;
      const hashedPassword = hashPassword(password);
      const adminId = generateIDS(); // Générer un GUID pour l'id

      // role par défaut = 1, state par défaut = 1
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, adminId)
        .input("email", sql.NVarChar(255), email)
        .input("password", sql.NVarChar(50), hashedPassword)
        .input("nom_prenom", sql.NVarChar(150), nom_prenom || null)
        .input("function", sql.NVarChar(150), adminFunction || null)
        .query(QUERY_INSERT_ADMIN);

      const admin = result.recordset[0];

      // Envoi automatique d'un email avec les identifiants du compte créé
      try {
        const html = `
          <p>Bonjour,</p>
          <p>Votre compte administrateur a été créé sur la plateforme.</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Mot de passe :</strong> ${password}</p>
          <p>Merci de vous connecter et de changer votre mot de passe après la première connexion.</p>
        `;

        await sendEmail(
          email,
          "Votre compte administrateur a été créé",
          html
        );
      } catch (emailError) {
        console.error("Error sending admin credentials email:", emailError);
        // On ne bloque pas la création du compte si l'email échoue
      }

      return {
        success: true,
        admin,
      };
    } catch (error) {
      console.error("Admin service error (createAdmin):", error);
      
      // Check for duplicate email error (SQL Server unique constraint violation)
      if (error.number === 2627 || error.number === 2601) {
        return {
          success: false,
          message: "Un compte avec cet email existe déjà.",
        };
      }
      
      return {
        success: false,
        message: error.message || "Database error while creating admin.",
      };
    }
  },

  //  Update state (Activer: state = 1, Désactiver: state = 0)
  updateAdminState: async (id, newState) => {
    try {
      const pool = await poolPromise;

      // S'assurer que newState est soit 0 soit 1
      const stateValue = newState === true || newState === 1 || newState === "1" ? 1 : 0;

      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .input("state", sql.Bit, stateValue)
        .query(QUERY_UPDATE_ADMIN_STATE);

      if (!result.recordset[0]) {
        return { success: false, message: "Admin not found." };
      }

      return {
        success: true,
        admin: result.recordset[0],
        message: stateValue === 1 ? "Compte activé avec succès." : "Compte désactivé avec succès.",
      };
    } catch (error) {
      console.error("Admin service error (updateAdminState):", error);
      return {
        success: false,
        message: "Database error while updating admin state.",
      };
    }
  },

  //  Delete admin
  deleteAdmin: async (id) => {
    try {
      const pool = await poolPromise;

      // Vérifier d'abord si l'admin existe
      const checkResult = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .query(`SELECT id, email FROM ADMINS WHERE id = @id`);

      if (!checkResult.recordset[0]) {
        return { success: false, message: "Admin not found." };
      }

      const adminEmail = checkResult.recordset[0].email;

      // Supprimer l'admin
      const result = await pool
        .request()
        .input("id", sql.UniqueIdentifier, id)
        .query(QUERY_DELETE_ADMIN);

      return {
        success: true,
        message: "Compte administrateur supprimé avec succès.",
        deletedEmail: adminEmail,
      };
    } catch (error) {
      console.error("Admin service error (deleteAdmin):", error);
      
      // Vérifier si l'erreur est due à une contrainte de clé étrangère
      if (error.number === 547) {
        return {
          success: false,
          message: "Impossible de supprimer ce compte car il est utilisé dans d'autres enregistrements.",
        };
      }
      
      return {
        success: false,
        message: error.message || "Database error while deleting admin.",
      };
    }
  },
};
