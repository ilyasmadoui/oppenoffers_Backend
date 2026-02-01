import * as comissionMemeberServices from '../../Services/sqlServer/comissionMemeberServices.js';

// Controller to add a commission member
export const addComissionMemberController = async (req, res) => {
    const { Nom, Prenom, Fonction, Email, Role, adminId, operationId } = req.body;
    if (!Nom || !Prenom || !Email || !Role || !adminId || !operationId) {
        return res.status(400).json({ success: false, message: "Nom, Prenom, Email, Role, adminId, and Id_Operation are required." });
    }
    try {
        const result = await comissionMemeberServices.addComissionMemeber(Nom, Prenom, Fonction, Email, Role, adminId, operationId);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const deleteComissionMemberController = async (req, res) => {
    try {
        const { id } = req.params; 
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: "ID du membre est requis." 
            });
        }

        console.log("(Comission Member controller - delete): ", id);
        
        const result = await comissionMemeberServices.deleteComissionMemeber(id);  
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        console.log("(Comission Member controller error - delete): ", error);
        return res.status(500).json({ 
            success: false, 
            message: "Erreur interne du serveur." 
        });
    }
};

export const getAllComissionMembersController = async (req, res) => {
    const adminId = req.query.adminId || req.query.adminID;

    if (!adminId) {
        return res.status(400).json({ 
            success: false, 
            message: "adminId is required as a query parameter." 
        });
    }
    try {
        const result = await comissionMemeberServices.getAllCommissionMembers(adminId);
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const updateComissionMemberController = async (req, res) => {
    const memberId = req.params.id;
    const { Nom, Prenom, Fonction, Email, Role } = req.body;
    
    if (!memberId) {
        return res.status(400).json({ success: false, message: "Member Id is required." });
    }
    
    try {
        const result = await comissionMemeberServices.updateComissionMemeber(
            memberId, 
            Nom, 
            Prenom, 
            Fonction, 
            Email, 
            Role, 
        );
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error", 
            error: error.message 
        });
    }
};