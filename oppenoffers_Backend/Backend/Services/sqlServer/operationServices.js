const { MAX } = require('mssql');
const { poolPromise, sql } = require('../../Config/dbSqlServer');

const parseNumericCode = (value) => {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : null;
};

const resolveTypeBudgetCode = (budgetType) => {
    const code = parseNumericCode(budgetType);
    if (code >= 1 && code <= 3) return code;
    switch (budgetType) {
        case 'Equipement': return 1;
        case 'Fonctionnement': return 2;
        case 'Opérations Hors Budget': return 3;
        default: return null;
    }
};

const resolveModeAttribuationCode = (method) => {
    const code = parseNumericCode(method);
    if (code >= 1 && code <= 2) return code;
    switch (method) {
        case "Appel d'Offres Ouvert": return 1;
        case "Appel d'Offres Restreint": return 2;
        default: return null;
    }
};

const resolveTypeTravauxCode = (travailType) => {
    const code = parseNumericCode(travailType);
    if (code >= 1 && code <= 4) return code;
    switch (travailType) {
        case 'Travaux': return 1;
        case 'Prestations': return 2;
        case 'Equipement': return 3;
        case 'Etude': return 4;
        default: return null;
    }
};

const validateOperation = async (operationId) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('operationId', sql.UniqueIdentifier, operationId)
            .query('UPDATE OPERATIONS SET State = 1 WHERE Id = @operationId');
        return { success: true };
    } catch (error) {
        console.error('Error in validateOperation:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    addOperationSQLServer: async (
        NumOperation, ServContract, Objectif,
        TravalieType, BudgetType, MethodAttribuation,
        VisaNum, DateVisa, adminID, Program, AP
    ) => {
        try {

            console.log('Received data:', {
                NumOperation, ServContract, Objectif,
                TravalieType, BudgetType, MethodAttribuation,
                VisaNum, DateVisa, adminID, Program, AP
            });

            const pool = await poolPromise;

            const typeBudgetCode = resolveTypeBudgetCode(BudgetType);
            const modeAttribuationCode = resolveModeAttribuationCode(MethodAttribuation);
            const typeTravauxCode = resolveTypeTravauxCode(TravalieType);

            console.log('Converted values:', {
                typeBudgetCode,
                modeAttribuationCode,
                typeTravauxCode,
                Objectif
            });

            const result = await pool.request()
                .input('aNumero', sql.VarChar(50), NumOperation)
                .input('aService_contractant', sql.NVarChar(200), ServContract)
                .input('aTypeBudget', sql.TinyInt, typeBudgetCode)
                .input('aModeAttribuation', sql.TinyInt, modeAttribuationCode)
                .input('aObjet', sql.NVarChar(sql.MAX), Objectif)
                .input('aTypeTravaux', sql.TinyInt, typeTravauxCode)
                .input('aNumeroVisa', sql.VarChar(50), VisaNum)
                .input('aDateVisa', sql.Date, DateVisa)
                .input('adminID', sql.UniqueIdentifier, adminID)
                .input('aProgram', sql.NVarChar(255), Program)
                .input('aAP', sql.Decimal(18, 2), AP)
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

    deleteOperationByIdSqlServer: async (operationID) => {
        try {
            console.log('Service delete operation received Number :', operationID)
            const pool = await poolPromise;
            const result = await pool.request()
                .input('operationID', sql.UniqueIdentifier, operationID)
                .query(`UPDATE OPERATIONS SET State = 0 WHERE Id = @operationID`);

            if (result.rowsAffected && result.rowsAffected[0] === 1) {
                return {
                    success: true,
                    code: 0,
                    message: "Operation deleted successfully"
                };
            } else {
                return {
                    success: false,
                    code: 1005,
                    message: "Operation not found"
                };
            }
        } catch (error) {
            if (
                error.message &&
                (
                    error.message.includes("REFERENCE constraint") ||
                    error.message.includes("supplier")
                )
            ) {
                return {
                    success: false,
                    code: 1000,
                    message: "Operation related to suppliers cannot be deleted"
                };
            }
            console.log("Delete Operation Service error:", error);
            return {
                success: false,
                code: 5000,
                message: "Database error occurred"
            };
        }
    },

    updateOperationStateSqlServer: async (operationId, newState) => {
        try {
            const pool = await poolPromise;

            await pool.request()
                .input('operationId', sql.UniqueIdentifier, operationId)
                .input('newState', sql.TinyInt, newState)
                .query(`
                    UPDATE OPERATIONS
                    SET State = @newState
                    WHERE Id = @operationId
                `);

            return { success: true };
        } catch (error) {
            console.error("Error in updateOperationStateSqlServer:", error);
            return {
                success: false,
                error: error.message
            };
        }
    },


    manageArchiveOperationSqlServer: async (id) => {
        try {
            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('id', sql.UniqueIdentifier, id)
                .execute('manageActivateOperation');

            const code = result.returnValue;

            switch (code) {
                case 1001:
                    return {
                        success: true,
                        code: 1001,
                        message: "Operation activated."
                    };
                case 1002:
                    return {
                        success: true,
                        code: 1002,
                        message: "Operation archived."
                    };
                default:
                    return {
                        success: false,
                        code: 5000,
                        message: "Unknown error occurred during manageArchiveOperation."
                    };
            }
        } catch (error) {
            console.error("Operation service error (manageArchiveOperationSqlServer):", error);
            return {
                success: false,
                code: 5000,
                message: "Database error occurred in manageArchiveOperation.",
                error: error.message
            };
        }
    },

    getOperationByIdSqlServer: async (operationId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('op', sql.UniqueIdentifier, operationId)
                .execute('GetOperationById');

            return {
                success: true,
                operation: (result.recordsets[0] && result.recordsets[0][0]) || null,
                lots: result.recordsets[1] || [],
                announces: result.recordsets[2] || [],
                message: "Data retrieved successfully"
            };
        } catch (error) {
            console.error("Operation service error (getOperationByIdSqlServer):", error);
            return {
                success: false,
                message: "Database error occurred in getOperationByIdSqlServer.",
                error: error.message
            };
        }
    },

    updateOperationSqlServer: async (data) => {
        console.log(' [Service] Data received for update:', {
            ...data,
            hasAdminID: !!data.adminID,
            adminID: data.adminID || 'NOT PROVIDED'
        });

        const {
            Id,
            NumOperation,
            ServContract,
            Objectif,
            TravalieType,
            BudgetType,
            MethodAttribuation,
            VisaNum,
            DateVisa,
            adminID,
            Program,
            AP
        } = data;

        try {
            const pool = await poolPromise;
            console.log(' [Service] Pool connection established');

            let operationId = Id;

            if (!operationId && NumOperation) {
                console.log(' [Service] Looking for operation by NumOperation:', NumOperation);
                const lookup = await pool
                    .request()
                    .input("NumOperation", sql.VarChar(50), NumOperation)
                    .query("SELECT TOP 1 Id FROM dbo.OPERATIONS WHERE Numero = @NumOperation");

                if (lookup.recordset.length) {
                    operationId = lookup.recordset[0].Id;
                    console.log(' [Service] Found operationId:', operationId);
                }
            }

            if (!operationId) {
                console.log(' [Service] Operation not found');
                return {
                    success: false,
                    code: 1005,
                    message: "Operation not found",
                };
            }

            console.log(' [Service] Operation ID to update:', operationId);
            console.log(' [Service] Admin ID to use:', adminID);

            const typeBudgetCode = resolveTypeBudgetCode(BudgetType);
            const modeAttribuationCode = resolveModeAttribuationCode(MethodAttribuation);
            const typeTravauxCode = resolveTypeTravauxCode(TravalieType);

            if (typeBudgetCode == null || modeAttribuationCode == null || typeTravauxCode == null) {
                return {
                    success: false,
                    code: 400,
                    message: 'Invalid budget type, allocation method, or work type.',
                };
            }

            console.log(' [Service] Converted values:', {
                typeBudgetCode,
                modeAttribuationCode,
                typeTravauxCode,
                Program,
                AP
            });

            if (!NumOperation) {
                return {
                    success: false,
                    code: 400,
                    message: "NumOperation is required",
                };
            }

            const request = pool.request();

            request.input("aId_Operation", sql.UniqueIdentifier, operationId);
            request.input("aNumero", sql.VarChar(50), NumOperation);
            request.input("aService_contractant", sql.NVarChar(200), ServContract);
            request.input("aTypeBudget", sql.TinyInt, typeBudgetCode);
            request.input("aModeAttribuation", sql.TinyInt, modeAttribuationCode);
            request.input("aObjet", sql.NVarChar(sql.MAX), Objectif);
            request.input("aTypeTravaux", sql.TinyInt, typeTravauxCode);
            request.input("aNumeroVisa", sql.VarChar(50), VisaNum);
            request.input("aDateVisa", sql.Date, DateVisa);
            request.input("aProgram", sql.NVarChar(255), Program ?? null);
            request.input("aAP", sql.Decimal(18, 2), AP !== '' && AP != null ? AP : null);

            console.log(' [Service] Executing stored procedure updateExistingOperation...');

            const updateResult = await request.execute("dbo.updateExistingOperation");

            const code = updateResult.returnValue;
            console.log(' [Service] Stored procedure return value:', code);

            if (code === 0) {
                console.log(' [Service] Update successful');
                return {
                    success: true,
                    code: 0,
                    message: "Operation updated successfully",
                    id: operationId,
                };
            }

            if (code === 1004 || code === 1005) {
                console.log(' [Service] Operation not found (code', code, ')');
                return {
                    success: false,
                    code: 1005,
                    message: "Operation not found",
                };
            }

            console.log(' [Service] Unknown error code:', code);
            return {
                success: false,
                code: code || 5000,
                message: "Failed to update operation",
            };
        } catch (error) {
            console.error(" [Service] Error in updateOperationSqlServer:", error);
            console.error(" [Service] Error details:", {
                message: error.message,
                code: error.code,
                number: error.number,
                state: error.state,
                class: error.class,
                serverName: error.serverName,
                procName: error.procName,
                lineNumber: error.lineNumber
            });

            return {
                success: false,
                code: 5000,
                message: "Database error occurred.",
                error: error.message,
            };
        }
    },
    validateOperationSqlServer: async (operationId) => {
        try {
            const result = await validateOperation(operationId);
            if (result.success) {
                return {
                    success: true,
                    message: 'Opération validée avec succès.'
                };
            } else {
                return {
                    success: false,
                    message: "Échec de la validation de l'opération.",
                    error: result.error || undefined
                };
            }
        } catch (error) {
            console.error("Error in validateOperationSqlServer:", error);
            return {
                success: false,
                message: "Une erreur de base de données s'est produite.",
                error: error.message
            };
        }
    },

    // In your operationService.js (backend)
    getOperationsByDate: async (adminId, sessionDate) => {
        const pool = await poolPromise;

        try {
            const request = pool.request();
            request.input("adminId", sql.UniqueIdentifier, adminId);
            request.input("sessionDate", sql.DateTime2(0), new Date(sessionDate));

            const result = await request.execute("getOperationsByDate");

            // Transform the results to group lots under operations
            const operationsMap = new Map();

            result.recordset.forEach(row => {
                if (!operationsMap.has(row.OperationId)) {
                    operationsMap.set(row.OperationId, {
                        id: row.OperationId,
                        Numero: row.Numero,
                        Service_Contractant: row.Service_Contractant,
                        Objet: row.Objet,
                        Description: row.Description,
                        Date_Overture: row.Date_Overture,
                        Date_Cloture: row.Date_Cloture,
                        Lots: []
                    });
                }

                // Add lot if it exists
                if (row.LotId) {
                    operationsMap.get(row.OperationId).Lots.push({
                        id: row.LotId,
                        NumeroLot: row.NumeroLot,
                        Designation: row.Designation
                    });
                }
            });

            const operations = Array.from(operationsMap.values());

            return {
                success: true,
                data: operations
            };
        } catch (error) {
            console.error("Error in getOperationsByDate:", error);
            return {
                success: false,
                message: "Erreur lors de la récupération des opérations",
                error: error.message
            };
        }
    },

    getOperationForBudgetManagement: async (adminId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('adminId', sql.UniqueIdentifier, adminId)
                .query(`
                    SELECT o.* 
                    FROM OPERATIONS o
                    WHERE o.State = 4 
                    AND o.adminId = @adminId
                    AND EXISTS (
                        SELECT 1 
                        FROM retrait_cahier_charges r 
                        WHERE r.OperationID = o.id
                    )
                        `);
            const operations = result.recordset;
            return {
                success: true,
                data: operations,
                count: operations.length
            };
        } catch (error) {
            console.error('Error in getOperationForBudgetManagement:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

};