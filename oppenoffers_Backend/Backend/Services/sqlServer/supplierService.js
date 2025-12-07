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
};