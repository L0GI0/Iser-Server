import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; //Bearer TOKEN
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.status(401).json({ error: "Null token" });
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
    if (error) return res.status(403).json({ message: error.message, requestStatus: 'failed' });
    req.user = user;
    next();
  });
}

const authoriseForAdminUsers = (req, res, next) => {
  try {
    if(req.user.user_type === 'admin'){
      next();
      return;
    }
    return res.status(401).json({ error: 'Insufficient permissions', requestStatus: 'unauthorised'});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export { authenticateToken, authoriseForAdminUsers };
