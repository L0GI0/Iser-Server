import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middleware/authorization.js";

const router = express.Router();

router.get("/all", authenticateToken, async (req, res) => {
  try {
    const profiles = await pool.query(`SELECT
    users.user_id AS "userId",
    profiles.first_name AS "firstName",
    profiles.last_name AS "lastName",
    profiles.gend as gender,
    profiles.birth_date AS "birthDate",
    profiles.location,
    profiles.language,
    profiles.role,
    users.user_email as "userEmail",
    users.user_type as "userType",
    users.user_status as "userStatus"
    FROM profiles INNER JOIN users ON users.user_id=profiles.profile_id`);

    res.json({ users: profiles.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticateToken, async (req, res) => {
  try {

    const user_id = req.user.user_id;

    const searchedProfile = await pool.query(
      `SELECT * FROM profiles WHERE profile_id = '${user_id}'`
    );

    res.json({ profile: searchedProfile.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const gender = req.body.gender;
    const birthDate = req.body.birthDate;
    const location = req.body.location;
    const language = req.body.language;
    const role = req.body.role;

    const user_id = req.user.user_id;

    await pool.query(
      `UPDATE profiles SET first_name = $1, last_name = $2, gend = $3, birth_date = $4, location = $5, language = $6, role = $7 WHERE profile_id = '${user_id}'`,
      [firstName, lastName, gender, birthDate, location, language, role]
    );
    res.json({ status: 200 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

export default router;
