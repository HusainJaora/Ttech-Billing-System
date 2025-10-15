const db = require("../db/database");

const getAuthStatus = async (req, res) => {
    try {
        const [user] = await db.query(
            "SELECT username, is_admin,email FROM signup WHERE signup_id = ?",
            [req.user.signup_id]
        );
        
        if (user.length > 0) {
            res.json({
                username: user[0].username,
                is_admin: user[0].is_admin,
                email:user[0].email
                
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = getAuthStatus;