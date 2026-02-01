const db = require('../../Config/dbSql');

module.exports = {

   addSupplierSQL: async (data) => {
        try {
            const {
                NomPrenom,
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

            await db.query(`
                CALL insertSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ResultCode);
            `, [
                NomPrenom,
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
            ]);

            const [rows] = await db.query('SELECT @p_ResultCode AS code');
            const code = rows?.[0]?.code;

            switch (code) {
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
                case 1004:
                    return { success: false, code: 1004, message: "Ce Téléphone existe déjà." };
                case 1005:
                    return { success: false, code: 1005, message: "Ce AI existe déjà." };
                case 1006:
                    return { success: false, code: 1006, message: "Ce RIB existe déjà." };
                case 1007:
                    return { success: false, code: 1007, message: "Ce Email existe déjà." };
                default:
                    return { success: false, code: 5000, message: "Erreur serveur SQL." };
            }

        } catch (error) {
            console.error('Service error (addSupplierSQL):', error);
            return {
                success: false,
                code: 5000,
                message: "Erreur de base de données.",
                error: error.message
            };
        }
    },

    getAllSuppliersSQL: async (adminID) => {
        try {
            const [rows] = await db.query(
            "SELECT getAllSuppliers(?) AS data",
            [adminID]
            );

            const suppliers = rows[0]?.data ? JSON.parse(rows[0].data) : [];

            return {
            success: true,
            data: suppliers,
            count: suppliers.length
            };

        } catch (error) {
            console.error('Service error (getAllSuppliersSQL):', error);
            return {
            success: false,
            data: [],
            message: error.message
            };
        }
    },



    deleteSupplierSQL: async (id) => {
        try {
            await db.query('CALL deleteSupplier(?)', [id]);
            
            return { success: true };
        } catch (error) {
            console.error('Service error (deleteSupplierSQL):', error);
            return { success: false };
        }
    },

    updateSupplierSQL: async (data) => {
        try {
            const {
                Id,
                NomPrenom,
                NomSociete,
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

            await db.query(`
                CALL updateSupplier(
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_ResultCode
                );
            `, [
                Id,
                NomPrenom,
                NomSociete,
                NatureJuridique,
                Adresse,
                Telephone,
                Rc,
                Nif,
                Rib,
                Email,
                Ai,
                AgenceBancaire
            ]);

            const [rows] = await db.query(
                'SELECT @p_ResultCode AS code'
            );

            const code = rows?.[0]?.code;

            switch(code) {
                case 0: return { success: true, code: 0, message: "Fournisseur mis à jour avec succès." };
                case 2005: return { success: false, code: 2005, message: "Fournisseur introuvable ou inactif." };
                case 1002: return { success: false, code: 1002, message: "Ce Registre de Commerce existe déjà." };
                case 1003: return { success: false, code: 1003, message: "Ce NIF existe déjà." };
                case 1004: return { success: false, code: 1004, message: "Ce numéro de téléphone est déjà utilisé." };
                case 1005: return { success: false, code: 1005, message: "Cet email est déjà utilisé." };
                case 1006: return { success: false, code: 1006, message: "Ce RIB est déjà utilisé." };
                case 1007: return { success: false, code: 1007, message: "Cet AI est déjà utilisé." };
                case 2010: return { success: false, code: 2010, message: "Le registre de commerce ne peut pas être modifié." };
                case 2011: return { success: false, code: 2011, message: "Le NIF ne peut pas être modifié." };
                case 2012: return { success: false, code: 2012, message: "Le RIB ne peut pas être modifié." };
                case 2013: return { success: false, code: 2013, message: "L’AI ne peut pas être modifié." };
                case 5000: return { success: false, code: 5000, message: "Une erreur est survenue lors de la mise à jour du fournisseur. Veuillez réessayer plus tard." };
                default: return { success: false, code: 5000, message: "Une erreur inconnue est survenue." };
            }

        } catch (error) {
            console.error('Service error (updateSupplierSQL):', error);
            return {
                success: false,
                code: 5000,
                message: "Erreur de base de données.",
                error: error.message
            };
        }
    },

    insertSelectedSupplier: async (data) => {
        try {
            const { NomPrenom, Adresse, Telephone, Email, adminID } = data;

            const [result] = await db.execute(
                "CALL insertFournisseurPotential(?, ?, ?, ?, ?)",
                [NomPrenom, Adresse, Telephone, Email, adminID]
            );

            return { success: true };

        } catch (error) {
            if (error.errno === 51004) {
                return {
                    success: false,
                    code: 1004,
                    message: "Le numéro de téléphone est déjà utilisé."
                };
            }

            if (error.errno === 51005) {
                return {
                    success: false,
                    code: 1005,
                    message: "L'email est déjà utilisé."
                };
            }

            console.error("Service error (insertSelectedSupplier):", error);
            return {
                success: false,
                code: 5000,
                message: "Erreur serveur lors de l'ajout."
            };
        }
    },
};