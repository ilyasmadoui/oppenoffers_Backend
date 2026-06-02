const express = require("express");
const router = express.Router();
const adminController = require("../../Controllers/sqlServer/adminController");
const authMiddleware = require("../../middleware/authMiddleware");

// Only admins with ROLE = 2 (CRUD admin) can access these routes
function requireCrudAdmin(req, res, next) {
  const role = req.userData?.role;
  // Convert to number for comparison (role might be stored as string in DB)
  if (Number(role) !== 2) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: insufficient privileges.",
    });
  }
  next();
}

router.use(authMiddleware, requireCrudAdmin);
router.get("/admins", adminController.getAllAdmins);
router.post("/admins", adminController.createAdmin);
router.patch("/admins/:id/state", adminController.updateAdminState);
router.delete("/admins/:id", adminController.deleteAdmin);

module.exports = router;


