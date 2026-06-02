const adminService = require("../../Services/sqlServer/adminServices");

module.exports = {
  getAllAdmins: async (req, res) => {
    try {
      const result = await adminService.getAllAdmins();
      if (!result.success) {
        return res.status(500).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      console.error("Admin controller error (getAllAdmins):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while fetching admins.",
      });
    }
  },

  createAdmin: async (req, res) => {
    try {
      const { email, password, nom_prenom, function: adminFunction } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required fields.",
        });
      }

      // role = 1 et state = 1 par défaut (gérés dans le service)
      const result = await adminService.createAdmin({
        email,
        password,
        nom_prenom,
        function: adminFunction,
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error("Admin controller error (createAdmin):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while creating admin.",
      });
    }
  },

  updateAdminState: async (req, res) => {
    try {
      const { id } = req.params;
      const { newState } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "L'ID de l'admin est requis.",
        });
      }

      if (typeof newState === "undefined" || newState === null) {
        return res.status(400).json({
          success: false,
          message: "newState est requis (0 pour désactiver, 1 pour activer).",
        });
      }

      const result = await adminService.updateAdminState(id, newState);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Admin controller error (updateAdminState):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while updating admin state.",
      });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "L'ID de l'admin est requis.",
        });
      }

      const result = await adminService.deleteAdmin(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Admin controller error (deleteAdmin):", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while deleting admin.",
      });
    }
  },

};



