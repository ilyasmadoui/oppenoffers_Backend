const authService = require('../../Services/sql/authServices');

const login = async (req, res) => {
    const { Email, Password } = req.body;
    try {
        const result = await authService.login(Email, Password);
        if (!result.success) {
            return res.status(401).json({ message: result.message });
        }
        res.json({
            token: result.token,
            userId: result.userId,
            message: result.message
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Internal server error." });
    }
};

module.exports = {
    login,
};