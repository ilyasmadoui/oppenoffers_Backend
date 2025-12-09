const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    addSupplierSQL: async (data) => {
       
        console.log(data);
        const {
            NomSociete,
            NatureJuridique,
            Adresse,
            Telephone,
            Rc,
            Nif,
            Rib,
            Email,
            Ai,
            AgenceBancaire,
            adminId
        } = data;


        try {
            const pool = await poolPromise;

            const result = await pool
                .request()
                .input("aNomSociete", sql.NVARCHAR(50), NomSociete)
                .input("aNatureJuridique", sql.NVARCHAR(50), NatureJuridique)
                .input("aAdresse", sql.NVARCHAR(50), Adresse)
                .input("aTelephone", sql.NVARCHAR(50), Telephone)
                .input("aRc", sql.NVARCHAR(50), Rc)
                .input("aNif", sql.NVARCHAR(50), Nif)
                .input("aRib", sql.NVARCHAR(50), Rib)
                .input("aEmail", sql.NVARCHAR(50), Email)
                .input("aAi", sql.NVARCHAR(50), Ai)
                .input("aAgenceBancaire", sql.NVARCHAR(50), AgenceBancaire)
                .input("adminID", sql.UniqueIdentifier, adminId)
                .execute("insertFournisseur");

            const insertCode = result.returnValue;

            if (insertCode === 0) {
                return {
                    success: true,
                    code: 0,
                    message: "Supplier added successfully.",
                };
            }

            if (insertCode === 1001) {
                return {
                    success: false,
                    code: 1001,
                    message: "Supplier already exists.",
                };
            }

            return {
                success: false,
                code: 5000,
                message: "General error occurred.",
            };
        } catch (error) {
            console.error("Supplier service error (addSupplierSqlServer):", error);
            return {
                success: false,
                code: 5000,
                message: "Database error occurred.",
                error: error.message,
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