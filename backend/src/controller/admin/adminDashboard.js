const db = require("../../db/database");
const getAllUser = async (req, res) => {
    try {
        const [user] = await db.query(`
        SELECT signup_id,username,email,created_date,created_time FROM signup`)
        if (!user) return res.status(404).json({ error: "User not found" });
        
        return res.status(200).json({ user });

    } catch (error) {
        console.log("Error Fetching user data",error);
        res.status(500).json({ message: "Server error.", error: error.message });

    }
}

module.exports = {getAllUser}
