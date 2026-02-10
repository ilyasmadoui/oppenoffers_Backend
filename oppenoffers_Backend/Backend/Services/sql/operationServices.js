const db = require('../../Config/dbSql');

module.exports = {
    addOperationSQL: async (data) => {
        try {
            const {
                NumOperation,
                ServContract,
                Objectif,
                TravalieType,
                BudgetType,
                MethodAttribuation,
                VisaNum,
                DateVisa,
                adminID    
            } = data;

            const typeTravaux =
                TravalieType === 'Travaux' ? 1 :
                TravalieType === 'Prestations' ? 2 :
                TravalieType === 'Equipement' ? 3 : 4;

            const typeBudget =
                BudgetType === 'Equipement' ? 1 :
                BudgetType === 'Fonctionnement' ? 2 : 3;

            const modeAttribuation =
                MethodAttribuation === "Appel d'Offres Ouvert" ? 1 : 2;

            console.log('🧩 Valeurs converties :', {
                NumOperation, ServContract, Objectif,
                typeTravaux, typeBudget, modeAttribuation,
                VisaNum, DateVisa, adminID 
            });

            await db.query(
                'CALL insertNewOperationSQL(?, ?, ?, ?, ?, ?, ?, ?, ?, @resultCode)',
                [
                    NumOperation,
                    ServContract,
                    typeBudget,
                    modeAttribuation,
                    Objectif,
                    typeTravaux,
                    VisaNum,
                    DateVisa,
                    adminID 
                ]
            );

            const [rows] = await db.query('SELECT @resultCode AS code');
            const resultCode = rows[0]?.code ?? null;

            console.log(' Résultat MySQL:', resultCode);

            return { code: resultCode };
        } catch (error) {
            console.error(' Service error:', error);
            throw error;
        }
    },

    getAllOperationsSQL: async (adminID) => {
        try {
            const [rows] = await db.query(
            "SELECT getAllOPERATIONSSQL(?) AS data",
            [adminID]
            );

            const operations = rows[0]?.data ? JSON.parse(rows[0].data) : [];

            return {
            success: true,
            data: operations,
            count: operations.length
            };

        } catch (error) {
            console.error('Error in getAllOperationsSQL:', error);
            return {
            success: false,
            message: error.message,
            data: []
            };
        }
    },


    deleteOperationSQL: async (NumOperation) => {
        try {
            console.log(' Suppression logique de l’opération:', NumOperation);

            await db.query('CALL DeleteOperationsSQL(?, @resultCode)', [NumOperation]);

            const [rows] = await db.query('SELECT @resultCode AS code');
            const resultCode = rows[0]?.code ?? null;

            console.log(' Résultat suppression:', resultCode);
            return { code: resultCode };
        } catch (error) {
            console.error(' Service error (deleteOperationSQL):', error);
            throw error;
        }
    }
};
