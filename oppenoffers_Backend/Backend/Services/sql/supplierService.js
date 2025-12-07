const db = require('../../Config/dbSql');

module.exports = {
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

            await db.query(`CALL insertSupplier(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @returnCode)`,
                [NomSociete, NatureJuridique, Adresse, Telephone, Rc, Nif, Rib, Email, Ai, AgenceBancaire, adminId]
            );

            const [rows] = await db.query('SELECT @returnCode AS code');

            const code = rows?.[0]?.code;

            return {
                success: code === 0,
                code
            };

        } catch (error) {
            console.error('Service error (addSupplierSQL):', error);
            return {
                success: false,
                code: 5000
            };
        }
    },

    getAllSuppliersSQL: async () => {
        try {
            const [rows] = await db.query('CALL getAllSuppliers()');

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