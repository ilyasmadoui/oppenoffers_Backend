const { poolPromise, sql } = require("../../Config/dbSqlServer");
const { generateIDS } = require('../../Helper');


// Function to insert potential supplier 
const insertPotentialSupplier = async (
    aId,
    aNom,
    aRaisonSocial,
    aDateDepot,
    aAdresse,
    aTelephone,
    aEmail,
    aAdminID
) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input("Id", sql.UniqueIdentifier, aId)
            .input("Nom", sql.NVARCHAR(100), aNom)
            .input('aRaisonSocial', sql.NVARCHAR(100), aRaisonSocial)
            .input('aDateDepot', sql.Date, aDateDepot)
            .input("Adresse", sql.NVARCHAR(100), aAdresse)
            .input("Telephone", sql.NVARCHAR(50), aTelephone)
            .input("Email", sql.NVARCHAR(100), aEmail)
            .input("Status", sql.Int, 1)
            .input("adminId", sql.UniqueIdentifier, aAdminID)
            .query(`INSERT INTO FOURNISSEURS 
                (Id, Nom, Adresse, Telephone, Email, Status, adminId, dateDepot, RaisonSocial)
                VALUES (@Id, @Nom, @Adresse, @Telephone, @Email, @Status, @adminId, @aDateDepot, @aRaisonSocial)`);
    } catch (error) {
        throw error;
    }
};


module.exports = {
    addSupplierSQL: async (data) => {
        try {

            console.log('data: ', data);
            const pool = await poolPromise;
            const result = await pool.request()
                .input("aNom", sql.NVARCHAR(100), data.Nom)
                .input('aRaisonSocial', sql.NVARCHAR(100), data.RaisonSocial)
                .input("aNatureJuridique", sql.NVARCHAR(50), data.NatureJuridique)
                .input("aAdresse", sql.NVARCHAR(50), data.Adresse)
                .input("aTelephone", sql.NVARCHAR(50), data.Telephone)
                .input("aRc", sql.NVARCHAR(50), data.Rc)
                .input("aNif", sql.NVARCHAR(50), data.Nif)
                .input("aRib", sql.NVARCHAR(50), data.Rib)
                .input("aEmail", sql.NVARCHAR(50), data.Email)
                .input("aAi", sql.NVARCHAR(50), data.Ai)
                .input("aAgenceBancaire", sql.NVARCHAR(50), data.AgenceBancaire)
                .input('adateDepot', sql.Date, data.DateDepot)
                .input("adminID", sql.UniqueIdentifier, data.adminId)
                .execute("insertFournisseur");

            const insertCode = result.returnValue;

            switch (insertCode) {
                case 0:
                    return {
                        success: true,
                        code: 0,
                        message: "Fournisseur ajouté avec succès.",
                        supplier: { ...data, Status: 1 }
                    };
                case 1002:
                    return { success: false, code: 1002, message: "Ce Registre de Commerce (RC) existe déjà." };
                case 1003:
                    return { success: false, code: 1003, message: "Ce NIF existe déjà." };
                case 1004:
                    return { success: false, code: 1004, message: "Ce numéro de téléphone existe déjà." };
                case 1005:
                    return { success: false, code: 1005, message: "Cet email ou RIB existe déjà." };
                case 1006:
                    return { success: false, code: 1006, message: "Ce numéro AI existe déjà." };
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
            const result = await pool.request()
                .input("aId", sql.UniqueIdentifier, id)
                .execute("deleteFournisseur");

            const code = result.returnValue;

            switch (code) {
                case 0:
                    return { success: true, code: 0, message: "Fournisseur archivé avec succès." };
                case 2000:
                    return {
                        success: false,
                        code: 2000,
                        message: "Impossible de supprimer ce fournisseur car il existe dans une opération de retrait (Retrait Cahier des Charges)."
                    };
                case 2005:
                    return {
                        success: false,
                        code: 2005,
                        message: "Fournisseur introuvable ou déjà archivé."
                    };
                default:
                    return {
                        success: false,
                        code: 5000,
                        message: "Erreur interne serveur SQL lors de la suppression du fournisseur."
                    };
            }
        } catch (error) {
            console.error("Service error (deleteFournisseur):", error);
            return {
                success: false,
                code: 5000,
                message: "Erreur de base de données lors de la suppression du fournisseur.",
                error: error.message
            };
        }
    },

    updateFournisseur: async (data) => {
        try {
            const {
                Id,
                Nom,
                RaisonSocial,
                DateDepot,
                NatureJuridique,
                Adresse,
                Telephone,
                Rc,
                Nif,
                Rib,
                Email,
                Ai,
                AgenceBancaire
            } = data;

            const pool = await poolPromise;

            const result = await pool
                .request()
                .input("aId", sql.UniqueIdentifier, Id)
                .input("aNom", sql.NVarChar(100), Nom)
                .input("aRaisonSocial", sql.NVarChar(100), RaisonSocial)
                .input("aNatureJuridique", sql.NVarChar(50), NatureJuridique)
                .input("aAdresse", sql.NVarChar(100), Adresse)
                .input("aTelephone", sql.NVarChar(50), Telephone)
                .input("aRc", sql.NVarChar(50), Rc)
                .input("aNif", sql.NVarChar(50), Nif)
                .input("aRib", sql.NVarChar(50), Rib)
                .input("aEmail", sql.NVarChar(100), Email)
                .input("aAi", sql.NVarChar(50), Ai)
                .input("aAgenceBancaire", sql.NVarChar(100), AgenceBancaire)
                .input("aDateDepot", sql.Date, DateDepot)
                .execute("updateFournisseur");

            const updateCode = result.returnValue;

            return {
                success: updateCode === 0,
                code: updateCode,
                message: updateCode === 0
                    ? "Fournisseur mis à jour avec succès."
                    : "Échec de la mise à jour du fournisseur."
            };

        } catch (error) {
            console.error("Service error (updateFournisseur):", error);
            return {
                success: false,
                code: 5000,
                message: "Erreur serveur."
            };
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

    insertSelectedSupplier: async (data) => {
        try {
            const {
                Nom,
                RaisonSocial,
                DateDepot,
                Adresse,
                Telephone,
                Email,
                adminID
            } = data;
            const id = generateIDS();
            insertPotentialSupplier(id, Nom, RaisonSocial, DateDepot, Adresse, Telephone, Email, adminID);
            return { success: true };
        } catch (error) {
            if (error && (error.number === 1004 || error.number === 1005)) {
                let msg = "";
                if (error.number === 1004) {
                    msg = "Le numéro de téléphone est déjà utilisé";
                } else if (error.number === 1005) {
                    msg = "L'email est déjà utilisé.";
                }
                return { success: false, code: error.number, message: msg };
            }
            console.error("Service error (insertSelectedSupplier):", error);
            return { success: false, code: 5000, message: error.message };
        }
    },

    // backend/service/supplierService.js
    getTopSupplier: async (lotId, operationId) => {
        try {
            const pool = await poolPromise;

            const request = pool.request()
                .input("OperationID", sql.UniqueIdentifier, operationId);

            if (lotId && lotId !== 'undefined' && lotId !== 'null') {
                request.input("LotID", sql.UniqueIdentifier, lotId);
            } else {
                request.input("LotID", sql.UniqueIdentifier, null);
            }

            const result = await request.execute("getTopSupplier");

            if (result.recordset && result.recordset[0]) {
                const data = result.recordset[0];

                // Transform the flat result into a nested supplier object
                const supplier = {
                    Id: data.Supplier_Id,
                    Nom: data.Supplier_Nom,
                    RaisonSocial: data.Supplier_RaisonSocial,
                    Nif: data.Supplier_Nif,
                    Rc: data.Supplier_Rc,
                    Ai: data.Supplier_Ai,
                    Adresse: data.Supplier_Adresse,
                    Telephone: data.Supplier_Telephone,
                    Email: data.Supplier_Email,
                    AgenceBancaire: data.Supplier_AgenceBancaire,
                    Rib: data.Supplier_Rib,
                    NatureJuridique: data.Supplier_NatureJuridique,
                    adminId: data.Supplier_adminId,
                    dateDepot: data.Supplier_dateDepot
                };

                // Also keep evaluation data if needed
                const evaluation = {
                    EvaluationID: data.EvaluationID,
                    SessionID: data.SessionID,
                    OperationID: data.OperationID,
                    LotID: data.LotID,
                    SupplierID: data.SupplierID,
                    AdminNote: data.AdminNote,
                    TechnicalNote: data.TechnicalNote,
                    FinancialNote: data.FinancialNote,
                    FinalNote: data.FinalNote,
                    CreatedAt: data.CreatedAt,
                    RejectionReason: data.RejectionReason
                };

                return {
                    success: true,
                    data: {
                        supplier: supplier,
                        evaluation: evaluation
                    }
                };
            }

            return {
                success: true,
                data: null
            };

        } catch (error) {
            console.error("Service error (getTopSupplier):", error);
            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }
}