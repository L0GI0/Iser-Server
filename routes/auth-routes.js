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
      return res.status(401).json({ error: "Email is incorrect" });
    //PASSWORD CHECK
    const isPasswordValid = await bcrypt.compare(
      accountPassword,
      user.user_password
    );
    if (!isPasswordValid)
      return res.status(401).json({ error: "Incorrect password" });

    //JWT
    let tokens = jwtTokens(user);
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
    });

    const profile = (await pool.query(`SELECT
      first_name,
      last_name,
      gend,
      to_char(birth_date, 'MM/DD/YYYY') as birth_date,
      location,
      language,
      role from profiles WHERE profile_id = '${user.user_id}'`)).rows[0];

    res.json({
      tokens: { ...tokens },
      profile: {
        firstName: profile.first_name,
        lastName: profile.last_name,
        gender: profile.gend,
        birthDate: profile.birth_date,
        location: profile.location,
        language: profile.language,
        role: profile.role
      }});
  } catch (error) {
    g(`Error when generating tokes = ${JSON.stringify(error.message)}`)
    res.status(401).json({ error: error.message });
  }
});

router.get("/refresh_token", (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken)
      return res.status(401).json({ error: "Null refresh token" });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) return res.status(403).json({ error: error.message });
        const tokens = jwtTokens(user);

        res.cookie("refresh_token", tokens.refreshToken, {
          httpOnly: true,
        });
        res.json({tokens: { accessToken: tokens.accessToken }});
      }
    );
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.delete("/refresh_token", (req, res) => {
  try {
    res.clearCookie("refresh_token");
    return res.status(200).json({ message: "refresh token deleted." });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
