const db = require('../../Config/dbSql');

module.exports = {

    // Rigl procedure stock bah y3od yrj3lk valuer fi Switch 
    addSupplierSQL: async (data) => {
        try {
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

            const [rows] = await db.query(`
                CALL insertSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @out_code);
                SELECT @out_code AS code;
            `, [NomSociete, NatureJuridique, Adresse, Telephone, Rc, Nif, Rib, Email, Ai, AgenceBancaire, adminId]);

            let code;
            if (Array.isArray(rows)) {
                const codeResult = Array.isArray(rows[1]) ? rows[1] : rows[0];
                code = codeResult?.[0]?.code;
            } else {
                code = rows?.code;
            }

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
            const [rows] = await db.query(`CALL getAllSuppliers(?)`, adminID);

            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Service error (getAllSuppliersSQL):', error);
            return {
                success: false,
                data: []
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
                NomSociete,
                NatureJuridique,
                Adresse,
                Telephone,
                Email,
                AgenceBancaire
            } = data;

            await db.query(
                `CALL updateSupplier(?, ?, ?, ?, ?, ?, ?, @returnCode)`,
                [Id, NomSociete, NatureJuridique, Adresse, Telephone, Email, AgenceBancaire]
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