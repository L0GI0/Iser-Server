import express from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import { authenticateToken, authoriseForAdminUsers } from "../middleware/authorization.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await pool.query("SELECT * FROM users");
    res.json({ users: users.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/ban/:id", [authenticateToken, authoriseForAdminUsers], async (req, res) => {
  try {

    const userId = req.params.id;

    const user = (await pool.query(`UPDATE users SET user_status = 'banned' WHERE user_id = '${userId}' RETURNING *`)).rows[0];

    res.status(200).json({ user: { emailAddress: user.user_email} });
  } catch (error) {
    res.status(500).json({ error: error.message, requestStatus: 'failed' });
  }
});

router.delete("/:id", [authenticateToken, authoriseForAdminUsers], async (req, res) => {
  const dbClient = await pool.connect();

  try {

    const userId = req.params.id;

    await dbClient.query('BEGIN');

    await dbClient.query(`DELETE FROM profiles WHERE profile_id = '${userId}'`);

    const removedUser = (await dbClient.query(`DELETE FROM users WHERE user_id = '${userId}' RETURNING *`)).rows[0];
    
    await dbClient.query('COMMIT');

    res.status(200).json({ user: { emailAddress: removedUser.user_email} });
  } catch (error) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ error: error.message, requestStatus: 'failed' });
  } finally {
    await dbClient.release();
  }
});

router.post("/", async (req, res) => {
  
  const dbClient = await pool.connect();

  try {
    const hashedPassword = await bcrypt.hash(req.body.accountPassword, 10);
    const usersEmail = req.body.accountLogin
    const emailParts = req.body.accountLogin.split("@");
    const userType = req.body.userType;

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const gender = req.body.gender;
    const birthDate = req.body.birthDate;
    const location = req.body.location;
    const language = req.body.language;
    const role = req.body.role;

    if(emailParts.length !== 2)
      throw new Error('Invalid adress email - can not parse user name')
    
    await dbClient.query('BEGIN');

    const insertUserQueryResponses = await dbClient.query(
      "INSERT INTO users (user_name, user_email, user_password, user_type, user_status) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [emailParts[0], usersEmail, hashedPassword, userType, 'active']
    );

    const newUserId = insertUserQueryResponses.rows[0].user_id;

    await dbClient.query(
      `INSERT INTO profiles (profile_id, first_name, last_name, gend, birth_date, location, language, role) values($1, $2, $3, $4, $5, $6, $7, $8)`,
      [newUserId, firstName, lastName, gender, birthDate, location, language, role]
    );

    await dbClient.query('COMMIT');

    res.status(200).json({ users: { emailAddress: usersEmail } });
  } catch (error) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    await dbClient.release();
  }
});

export default router;
