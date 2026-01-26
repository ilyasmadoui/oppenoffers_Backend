import { poolPromise, sql } from '../../Config/dbSqlServer.js';

export const addComissionMemeber = async (
    Nom, Prenom, Fonction, 
    Email, Role, adminId, operationId
) => {
   try {
    const pool = await poolPromise; 

    const result = await pool.request()
    .input('Nom',sql.NVARCHAR(255), Nom)
    .input('Prenom',sql.NVARCHAR(255), Prenom)
    .input('Fonction',sql.NVARCHAR(255), Fonction)
    .input('Email', sql.NVARCHAR(255),Email)
    .input('Role',sql.NVARCHAR(255),Role)
    .input('adminId',sql.UniqueIdentifier, adminId)
    .input('operationId', sql.UniqueIdentifier, operationId)
    .execute('insertMembreCommission')

    const insertResult = result.returnValue;

    switch (insertResult) {
        case 0:
            return { success: true, code: 0, message: 'Membre de commission ajouté avec succès.' };
        case 1001:
            return { success: false, code: 1001, message: "Le rôle spécifié n'est pas valide. Les rôles valides sont : Président, Membre, Secrétaire." };
        case 1002:
            return { success: false, code: 1002, message: "Un membre avec cet email existe déjà dans la commission." };
        case 1000:
        default:
            return { success: false, code: 1000, message: "Erreur lors de l'ajout du membre de commission." };
    }
   } catch (error) {
    console.log("(Comission Member services error ): ", error);
    return { success: false, code: 5000, message: 'General error occurred.', error: error.message };
   }
}; 

export const deleteComissionMemeber = async (Id) => {
    try {
        const pool = await poolPromise;
        console.log("(Comission Member services - delete): ", Id);
        const result = await pool.request()
            .input('Id', sql.UniqueIdentifier, Id)
            .execute('deleteMembreCommission');
        
        const deleteResult = result.returnValue;

        switch (deleteResult) {
            case 0:
                return { success: true, code: 0, message: "Membre de commission supprimé avec succès." };
            case 1001:
                return { success: false, code: 1001, message: "Le membre de commission n'existe pas." };
            case 1000:
            default:
                return { success: false, code: 1000, message: "Erreur lors de la suppression du membre de commission." };
        }
    } catch (error) {
        console.log("(Comission Member services error - delete): ", error);
        return { success: false, code: 5000, message: 'General error occurred.', error: error.message };
    }
};

export const getAllCommissionMembers = async (adminId) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
        .input('adminId', sql.UniqueIdentifier, adminId)
        .query(`SELECT * FROM dbo.getAllMembresCommission(@adminId)`);

        if (result && result.recordset) {
            return { success: true, code: 0, members: result.recordset };
        } else {
            return { success: false, code: 1000, message: "Erreur lors de la récupération des membres de commission." };
        }
    } catch (error) {
        console.log("(Comission Member services error - getAllCommissionMembers): ", error);
        return { success: false, code: 5000, message: 'General error occurred.', error: error.message };
    }
};

export const updateComissionMemeber = async (Id, Nom, Prenom, Fonction, Email, Role) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Id', sql.UniqueIdentifier, Id) 
            .input('Nom', sql.NVARCHAR(255), Nom)
            .input('Prenom', sql.NVARCHAR(255), Prenom)
            .input('Fonction', sql.NVARCHAR(255), Fonction)
            .input('Email', sql.NVARCHAR(255), Email)
            .input('Role', sql.NVARCHAR(50), Role)
            .execute('updateMembreCommission');
        
        const updateResult = result.returnValue;

        switch (updateResult) {
            case 0:
                return { 
                    success: true, 
                    code: 0, 
                    message: "Membre de commission modifié avec succès." 
                };
            case 1001:
                return { 
                    success: false, 
                    code: 1001, 
                    message: "Le membre de commission n'existe pas." 
                };
            case 1002:
                return { 
                    success: false, 
                    code: 1002, 
                    message: "Le rôle spécifié n'est pas valide." 
                };
            case 1003:
                return { 
                    success: false, 
                    code: 1003, 
                    message: "Un membre avec cet email existe déjà dans la commission." 
                };
            case 1000:
            default:
                return { 
                    success: false, 
                    code: 1000, 
                    message: "Erreur lors de la modification du membre de commission." 
                };
        }
    } catch (error) {
        console.log("(Comission Member services error - update): ", error);
        return { 
            success: false, 
            code: 5000, 
            message: 'General error occurred.', 
            error: error.message 
        };
    }
};