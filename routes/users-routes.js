import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json({ users: users.rows });
  } catch (error) {
    console.log(`Error = ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.accountPassword, 10);
    const usersEmail = req.body.accountLogin
    const emailParts = req.body.accountLogin.split("@");
    const userType = req.body.accountType;

    console.log(`User type = ${userType}`)

    if(emailParts.length !== 2)
      throw new Error('Invalid adress email - can not parse user name')
      
    const newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password, user_type) VALUES($1, $2, $3, $4) RETURNING *",
      [emailParts[0], usersEmail, hashedPassword, userType]
    );
    res.json({ users: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
