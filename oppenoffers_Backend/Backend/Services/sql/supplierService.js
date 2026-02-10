const db = require('../../Config/dbSql');

module.exports = {

    // Rigl procedure stock bah y3od yrj3lk valuer fi Switch 
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
                Adresse,
                Telephone,
                Email,
                AgenceBancaire
            } = data;

            await db.query(
                `CALL updateSupplier(?, ?, ?, ?, ?, ?, ?, @returnCode)`,
                [Id, NomPrenom, NomSociete , Adresse, Telephone, Email, AgenceBancaire]
            );

            const [rows] = await db.query('SELECT @returnCode AS code');
            const code = rows?.[0]?.code;

            return { success: code === 0, code };
        } catch (error) {
            console.error('Service error (updateSupplierSQL):', error);
            return { success: false, code: 5000 };
        }
    },


};