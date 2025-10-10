const db = require("../db/database");
const jwt = require("jsonwebtoken");
const { hashtoken } = require("../utils/tokenutils");

const refreshAccessToken = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
    }

    try {
        const tokenHash = hashtoken(refreshToken);
        const [rows] = await db.query("SELECT * FROM refresh_token WHERE token_hash = ?", [tokenHash]);

        if (rows.length === 0) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        const storedToken = rows[0];

        if (new Date(storedToken.expires_at) < new Date()) {
            return res.status(403).json({ error: "Invalid or expired refresh token" });
        }

        const payload = { signup_id: storedToken.signup_id };
        const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });

        // Set new access token in cookie
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000
        });

        return res.json({ message: "Token refreshed successfully",
            newAccessToken });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
};


module.exports = refreshAccessToken;
