const db = require("../db/database");
const { hashtoken } = require("../utils/tokenutils");

// const logout = async (req, res) => {
//     const { refreshToken } = req.body;

//     if (!refreshToken) return res.status(400).json({ error: "Refresh token required" });

//     const tokenHash = hashtoken(refreshToken);

//     try {
//         await db.query(`DELETE FROM refresh_tokens WHERE token_hash = ?`, [tokenHash]);

//         res.status(200).json({ message: "Logged out successfully" });



//     } catch (error) {
//         res.status(500).json({ error: "Internal Server Error" });

//     }



// }





const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        
        // Delete refresh token from database
        if (refreshToken) {
            const tokenHash = hashtoken(refreshToken);
            await db.query(
                "DELETE FROM refresh_token WHERE token_hash = ?",
                [tokenHash]
            );
        }

        // Clear cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if DB operation fails
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });

        res.status(200).json({ message: "Logged out successfully" });
    }
};



module.exports = logout;

