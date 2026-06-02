const { poolPromise, sql } = require('../../Config/dbSqlServer');
const { generateIDS } = require('../../Helper');
// Type mapping for conversion between numeric values and labels
const TravauxTypeMap = {
    1: 'Travaux',
    2: 'Prestations',
    3: 'Equipement',
    4: 'Etude'
};

const ReverseTravauxTypeMap = {
    'Travaux': 1,
    'Prestations': 2,
    'Equipement': 3,
    'Etude': 4
};

module.exports = {

    getPartitonsByOperationId: async (operationId) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .input('operationId', sql.UniqueIdentifier, operationId)
                .query(`
                    SELECT 
                        ap.Id,
                        ap.OperationId,
                        ap.TravauxType,
                        ap.Description,
                        ap.Budget,
                        o.AP as OperationAP
                    FROM ApPartitions ap
                    INNER JOIN Operations o ON ap.OperationId = o.Id
                    WHERE ap.OperationId = @operationId
                    ORDER BY ap.TravauxType
                `);

            // Add type label to each partition
            const partitionsWithLabel = result.recordset.map(partition => ({
                ...partition,
                TravauxTypeLabel: TravauxTypeMap[partition.TravauxType] || 'Unknown',
                Budget: partition.Budget || 0
            }));

            return {
                success: true,
                data: partitionsWithLabel
            };
        } catch (error) {
            console.error('Error in getByOperationId:', error);
            throw error;
        }
    },

    checkDuplicateType: async (operationId, travauxType) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('operationId', sql.UniqueIdentifier, operationId)
                .input('travauxType', sql.TinyInt, travauxType)
                .query(`
                    SELECT COUNT(*) as count 
                    FROM ApPartitions 
                    WHERE OperationId = @operationId AND TravauxType = @travauxType
                `);

            return result.recordset[0].count > 0;
        } catch (error) {
            console.error('Error in checkDuplicateType:', error);
            throw error;
        }
    },


    createApPartition: async (operationId, travauxType, description, budget) => {
        try {
            // Validate travauxType
            if (!travauxType || ![1, 2, 3, 4].includes(travauxType)) {
                throw new Error('Type de travaux invalide. Valeur acceptée: 1,2,3,4');
            }

            // Validate budget
            if (budget === undefined || budget === null) {
                throw new Error('Le budget est requis');
            }

            if (isNaN(budget) || budget < 0) {
                throw new Error('Le budget doit être un nombre positif');
            }

            // Validate description length
            if (description && description.length > 100) {
                throw new Error('La description ne peut pas dépasser 100 caractères');
            }

            // Check for duplicate
            const exists = await module.exports.checkDuplicateType(operationId, travauxType);
            if (exists) {
                throw new Error(`Le type "${TravauxTypeMap[travauxType]}" existe déjà pour cette opération`);
            }
            const id = generateIDS();
            const pool = await poolPromise;
            const result = await pool.request()

                .input('id', sql.UniqueIdentifier, id)
                .input('operationId', sql.UniqueIdentifier, operationId)
                .input('travauxType', sql.TinyInt, travauxType)
                .input('description', sql.NVarChar(100), description || null)
                .input('budget', sql.Decimal(18, 2), budget)
                .query(`
                    INSERT INTO ApPartitions (Id, OperationId, TravauxType, Description, Budget)
                    VALUES (@id, @operationId, @travauxType, @description, @budget)
                `);

            return {
                success: true,
                message: 'Partition ajoutée avec succès'
            };
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    },

    updateApPartition: async (id, description, budget) => {
        try {
            // Validate budget
            if (budget !== undefined && budget !== null) {
                if (isNaN(budget) || budget < 0) {
                    throw new Error('Le budget doit être un nombre positif');
                }
            }

            // Validate description length
            if (description && description.length > 100) {
                throw new Error('La description ne peut pas dépasser 100 caractères');
            }

            // Check if partition exists
            const pool = await poolPromise;
            const checkResult = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query(`SELECT Id FROM ApPartitions WHERE Id = @id`);

            if (checkResult.recordset.length === 0) {
                throw new Error('Partition non trouvée');
            }

            // Build dynamic update query based on provided fields
            let updateFields = [];
            let request = pool.request();
            request.input('id', sql.UniqueIdentifier, id);

            if (description !== undefined) {
                updateFields.push('Description = @description');
                request.input('description', sql.NVarChar(100), description || null);
            }

            if (budget !== undefined) {
                updateFields.push('Budget = @budget');
                request.input('budget', sql.Decimal(18, 2), budget);
            }

            if (updateFields.length === 0) {
                throw new Error('Aucune donnée à mettre à jour');
            }

            // Update partition
            await request.query(`
                UPDATE ApPartitions 
                SET ${updateFields.join(', ')}
                WHERE Id = @id
            `);

            return {
                success: true,
                message: 'Partition modifiée avec succès'
            };
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    },

    deleteApPartiton: async (id) => {
        try {
            const pool = await poolPromise;

            // Check if partition exists
            const checkResult = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query(`SELECT Id FROM ApPartitions WHERE Id = @id`);

            if (checkResult.recordset.length === 0) {
                throw new Error('Partition non trouvée');
            }

            // Delete partition
            await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .query(`DELETE FROM ApPartitions WHERE Id = @id`);

            return {
                success: true,
                message: 'Partition supprimée avec succès'
            };
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    },

    getPartitionDetails: async (operationId, partitionId) => {
        try {
            const pool = await poolPromise;

            // Get partition basic info
            const partitionResult = await pool.request()
                .input('partitionId', sql.UniqueIdentifier, partitionId)
                .query(`
            SELECT Id, TravauxType, Description, Budget 
            FROM ApPartitions 
            WHERE Id = @partitionId
        `);

            if (partitionResult.recordset.length === 0) {
                throw new Error('Partition non trouvée');
            }

            const partitionInfo = partitionResult.recordset[0];
            const partitionBudget = parseFloat(partitionInfo.Budget) || 0;

            // Execute the stored procedure
            const result = await pool.request()
                .input('OperationID', sql.UniqueIdentifier, operationId)
                .input('PartitionID', sql.UniqueIdentifier, partitionId)
                .execute('GetEngagementAndPaymentByPartition');

            const records = result.recordset || [];

            // Calculate stats
            let validatedEngagementsCount = 0;
            let pendingEngagementsCount = 0;
            let validatedPaymentsCount = 0;
            let pendingPaymentsCount = 0;
            let totalValidatedPaymentAmount = 0;

            // Get ALL validated payment records
            const paymentRecords = records.filter(r => r.PaymentID && parseInt(r.PaymentStatus) === 2);

            // Sort payments by date
            paymentRecords.sort((a, b) => new Date(a.PaymentDate || 0) - new Date(b.PaymentDate || 0));

            // Build timeline with cumulative reductions
            const timeline = [];

            // Start with initial budget at date 0
            timeline.push({
                date: 'Initial',
                remainingBudget: partitionBudget,
                amountReduced: 0,
                cumulativeReduced: 0,
                reference: ''
            });

            // Track cumulative reductions
            let cumulativeReduced = 0;

            // Add each payment as a reduction point
            for (let i = 0; i < paymentRecords.length; i++) {
                const payment = paymentRecords[i];
                const amount = parseFloat(payment.Amount || 0);
                cumulativeReduced += amount;
                const remainingAfterPayment = Math.max(0, partitionBudget - cumulativeReduced);

                // Format date properly
                const paymentDate = payment.PaymentDate
                    ? new Date(payment.PaymentDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];

                timeline.push({
                    date: paymentDate,
                    remainingBudget: remainingAfterPayment,
                    amountReduced: amount, // This is the amount deducted at this point
                    cumulativeReduced: cumulativeReduced,
                    reference: payment.Referece || payment.Reference || '',
                    engagementDescription: payment.Description || ''
                });
            }

            // Calculate total validated payments
            for (const row of records) {
                const amount = parseFloat(row.Amount || 0);
                const paymentStatus = parseInt(row.PaymentStatus);

                if (paymentStatus === 2) {
                    validatedPaymentsCount++;
                    totalValidatedPaymentAmount += amount;
                } else if (paymentStatus === 1) {
                    pendingPaymentsCount++;
                }
            }

            // Process engagements stats
            const uniqueEngagementsMap = new Map();

            for (const row of records) {
                const amount = parseFloat(row.Amount || 0);
                const engagementStatus = parseInt(row.EngagementStatus);

                if (engagementStatus === 2) validatedEngagementsCount++;
                if (engagementStatus === 1) pendingEngagementsCount++;

                const reference = row.Referece || row.Reference || '';
                if (!uniqueEngagementsMap.has(reference) && reference) {
                    uniqueEngagementsMap.set(reference, {
                        reference: reference,
                        amount: amount,
                        description: row.Description || '',
                        date: row.EngagementDate || '',
                        status: engagementStatus
                    });
                }
            }

            const uniqueEngagements = Array.from(uniqueEngagementsMap.values());
            const remainingBudget = Math.max(0, partitionBudget - totalValidatedPaymentAmount);

            const TravauxTypeMap = {
                0: 'Travaux Type 0',
                1: 'Travaux Type 1',
                2: 'Travaux Type 2',
            };

            return {
                partition: {
                    id: partitionInfo.Id,
                    travauxType: TravauxTypeMap[partitionInfo.TravauxType] || partitionInfo.TravauxType || 'Unknown',
                    description: partitionInfo.Description,
                    budget: partitionBudget,
                    remainingBudget: remainingBudget
                },
                stats: {
                    engagements: { validated: validatedEngagementsCount, pending: pendingEngagementsCount },
                    payments: { validated: validatedPaymentsCount, pending: pendingPaymentsCount }
                },
                timeline: timeline,
                engagements: uniqueEngagements.sort((a, b) => new Date(b.date) - new Date(a.date))
            };

        } catch (error) {
            console.error('Error in getPartitionDetails:', error);
            throw error;
        }
    },
    TravauxTypeMap,
    ReverseTravauxTypeMap
};