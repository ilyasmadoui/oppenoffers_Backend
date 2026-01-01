const {poolPromise, sql } = require('../../Config/dbSqlServer');

module.exports = {
addOperationSQLServer: async (
        NumOperation, ServContract, Objectif,
        TravalieType, BudgetType, MethodAttribuation,
        VisaNum, DateVisa,adminID
    ) => {
        try {
            const pool = await poolPromise;
            
            const typeBudgetCode = (() => {
                switch (BudgetType) {
                    case 'Equipement': return 1;
                    case 'Fonctionnement': return 2;
                    case 'Opérations Hors Budget': return 3;
                    default: return null;
                }
            })();

            const modeAttribuationCode = (() => {
                switch (MethodAttribuation) {
                    case "Appel d'Offres Ouvert": return 1;
                    case "Appel d'Offres Restreint": return 2;
                    default: return null;
                }
            })();

            const typeTravauxCode = (() => {
                switch (TravalieType) {
                    case 'Travaux': return 1;
                    case 'Prestations': return 2;
                    case 'Equipement': return 3;
                    case 'Etude': return 4;
                    default: return null;
                }
            })();

            console.log('Converted values:', {
                typeBudgetCode,
                modeAttribuationCode, 
                typeTravauxCode,
                Objectif
            });

            const result = await pool.request()
            .input('aNumero', sql.VarChar(50), NumOperation)
            .input('aService_contractant', sql.VarChar(200), ServContract)
            .input('aTypeBudget', sql.TinyInt, typeBudgetCode)
            .input('aModeAttribuation', sql.TinyInt, modeAttribuationCode)
            .input('aObjet', sql.VarChar(500), Objectif)
            .input('aTypeTravaux', sql.TinyInt, typeTravauxCode)
            .input('aNumeroVisa', sql.VarChar(50), VisaNum)
            .input('aDateVisa', sql.Date, DateVisa)
            .input('adminID', sql.UniqueIdentifier, adminID)
            .execute('insertNewOperation');

            const operationResult = result.returnValue;
            
            if (operationResult === 0) {
                return { success: true, code: 0, message: 'Operation added successfully.' };
            } else if (operationResult === 1001) {
                return { success: false, code: 1001, message: 'Operation already exists.' };
            } else {
                return { success: false, code: 5000, message: 'General error occurred.' };
            }
        } catch (error) {
            console.log("(Operation services error ): ", error);
            return { success: false, code: 5000, message: 'General error occurred.', error: error.message };
        }
    },
    
    getAllOperationSQLServer: async (adminID) => {
        try {
            const pool = await poolPromise;
            
            const result = await pool.request()
                .query(`SELECT * FROM dbo.GetAllOperations('${adminID}')`);
            
            const operations = result.recordset;
            return {
                success: true,
                data: operations,
                count: operations.length
            };
        } catch (error) {
            console.error('Error in getAllOperationSQLServer:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    },

    deleteOperationByIdSqlServer: async (Num_Operation) => {
        try {
            console.log('Service delete operation recieved Number :', Num_Operation)
            const pool = await poolPromise;
            const result = await pool.request()
                .input('Num_Operation', sql.VarChar(50), Num_Operation)
                .execute('dbo.deleteOperation');
    
            const deleteResult = result.returnValue;
    
            if (deleteResult === 0) {
                return {
                    success: true,
                    message: "Operation deleted successfully"
                };
            } else if (deleteResult === 1005) {
                return {
                    success: false,
                    message: "Operation not found"
                };
            } else {
                return {
                    success: false,
                    message: "An error occurred while deleting Operation"
                };
            }
        } catch (error) {
            console.log("Delete Operation Service error:", error);
            return {
                success: false,
                message: "Database error occurred"
            };
        }
    }
};