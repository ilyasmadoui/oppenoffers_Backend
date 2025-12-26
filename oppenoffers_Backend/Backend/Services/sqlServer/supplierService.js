const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    addSupplierSQL: async (data) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input("aNomSociete", sql.NVARCHAR(100), data.NomSociete) 
                .input("aNatureJuridique", sql.NVARCHAR(50), data.NatureJuridique)
                .input("aAdresse", sql.NVARCHAR(50), data.Adresse) 
                .input("aTelephone", sql.NVARCHAR(50), data.Telephone)
                .input("aRc", sql.NVARCHAR(50), data.Rc)
                .input("aNif", sql.NVARCHAR(50), data.Nif)
                .input("aRib", sql.NVARCHAR(50), data.Rib)
                .input("aEmail", sql.NVARCHAR(100), data.Email)
                .input("aAi", sql.NVARCHAR(50), data.Ai)
                .input("aAgenceBancaire", sql.NVARCHAR(100), data.AgenceBancaire)
                .input("adminID", sql.UniqueIdentifier, data.adminId)
                .execute("insertFournisseur");
    
            const insertCode = result.returnValue;
    
            switch (insertCode) {
                case 0:
                    return { 
                        success: true, 
                        code: 0, 
                        message: "Succès",
                        supplier: { ...data, Status: 1 }
                    };
                case 1002:
                    return { success: false, code: 1002, message: "Ce Registre de Commerce existe déjà." };
                case 1003:
                    return { success: false, code: 1003, message: "Ce NIF existe déjà." };
                default:
                    return { success: false, code: 5000, message: "Erreur serveur SQL." };
            }
        } catch (error) {
            console.error("SQL Error Details:", error.message); 
            return {
                success: false,
                code: 5000,
                message: "Erreur de base de données.",
                error: error.message
            };
        }
    },
    deleteFournisseur: async (id) => {
        try {
            const pool = await poolPromise;
            await pool.request().input("aId", sql.UniqueIdentifier, id).execute("deleteFournisseur");
            return { success: true };
        } catch (error) {
            console.error("Service error (deleteFournisseur):", error);
            return { success: false };
        }
    },

    updateFournisseur: async (data) => {
        try {
            const {
                Id,
                NomSociete,
                NatureJuridique,
                Adresse,
                Telephone,
                Email,
                AgenceBancaire
            } = data;
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input("aId", sql.UniqueIdentifier, Id)
                .input("aNomSociete", sql.NVARCHAR(50), NomSociete)
                .input("aNatureJuridique", sql.NVARCHAR(50), NatureJuridique)
                .input("aAdresse", sql.NVARCHAR(50), Adresse)
                .input("aTelephone", sql.NVARCHAR(50), Telephone)
                .input("aEmail", sql.NVARCHAR(50), Email)
                .input("aAgenceBancaire", sql.NVARCHAR(50), AgenceBancaire)
                .execute("updateFournisseur");

            const updateCode = result.returnValue;
            return { success: updateCode === 0, code: updateCode };
        } catch (error) {
            console.error("Service error (updateFournisseur):", error);
            return { success: false, code: 5000 };
        }
    },

    selectAllFournisseurs: async (adminID) => {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('adminID', sql.UniqueIdentifier, adminID)
                .query("SELECT * FROM selectAllFournisseurs(@adminID)");
            return { success: true, data: result.recordset };
        } catch (error) {
            console.error("Service error (selectAllFournisseurs):", error);
            return { success: false, data: [] };
        }
    },
}