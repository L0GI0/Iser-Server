import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtTokens } from "../utils/jwt-helpers.js";
import { authenticateToken } from "../middleware/authorization.js";
const router = express.Router();

router.get('/authenticate', authenticateToken, (req, res) => {
  res.status(200).json({authenticated: true})
});

router.post("/login", async (req, res) => {
  try {
    const { accountLogin, accountPassword } = req.body;
    const users = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [accountLogin]
    );

    const user = users.rows[0];

    if (users.rows.length === 0)
      return res.status(401).json({ requestStatus: "unauthorised" });

    if (users.rows[0].user_status === 'banned'){
      return res.status(401).json({ requestStatus: "forbidden" });
    }
    //PASSWORD CHECK
    const isPasswordValid = await bcrypt.compare(
      accountPassword,
      user.user_password
    );
    if (!isPasswordValid)
      return res.status(401).json({ requestStatus: "unauthorised" });

    //JWT
    let tokens = jwtTokens(user);
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      domain: "iser-server.vercel.app"
    });

    const account = (await pool.query(`SELECT
    users.user_id AS "userId",
    profiles.first_name AS "firstName",
    profiles.last_name AS "lastName",
    profiles.gend AS gender,
    to_char(profiles.birth_date, 'MM/DD/YYYY') AS "birthDate",
    profiles.location,
    profiles.language,
    profiles.role,
    users.user_email AS "emailAddress",
    users.user_type AS "userType",
    users.user_status AS "userStatus"
    FROM profiles INNER JOIN users ON users.user_id=profiles.profile_id
    WHERE user_id = '${user.user_id}'`)).rows[0];

    res.json({
      tokens: { accessToken: tokens.accessToken },
      account: account,
    });
  } catch (error) {
    res.status(401).json({ requestStatus: 'failed', error: error.message });
  }
});

router.get("/refresh_token", async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken)
      return res.status(401).json({ error: "Null refresh token" });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (error, user) => {
        if (error ) return res.status(403).json({ error: error.message });
        
        const updatedUserData = (await pool.query(
          `SELECT * FROM users WHERE user_id = '${user.user_id}'`)).rows[0];

        if (updatedUserData.user_status === 'banned') return res.status(403).json({ error: 'Account banned', requestStatus: 'forbidden' });
          
        const tokens = jwtTokens(updatedUserData);

        res.cookie("refresh_token", tokens.refreshToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
          domain: "iser-server.vercel.app"
        });
        res.json({
          tokens: { accessToken: tokens.accessToken },
          user: { userType: updatedUserData.user_type }});
      }
    );
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete("/refresh_token", (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "refresh token deleted" });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
