const db = require("../db/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateRefreshToken, hashtoken } = require("../utils/tokenutils");



const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const [existing] = await db.query(
            "SELECT * FROM signup WHERE email = ?",
            [email.trim().toLowerCase()]
        );

        const user = existing[0];
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const accessToken = jwt.sign(
            { signup_id: user.signup_id, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = generateRefreshToken();
        const tokenHash = hashtoken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            `INSERT INTO refresh_token (signup_id, token_hash, expires_at) VALUES (?, ?, ?)`,
            [user.signup_id, tokenHash, expiresAt]
        );

        // Set HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Return user data (not tokens)
        res.status(200).json({
            message: "Logged in successfully",
            username: user.username,
            is_admin:user.is_admin,
            email:user.email,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports =  login;
   
