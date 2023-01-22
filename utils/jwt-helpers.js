import jwt from "jsonwebtoken";

function jwtTokens({ user_id, user_name, user_email, user_type, user_status }) {
  //jwt.sign() argument is token payload
  const user = { user_id, user_name, user_email, user_type, user_status };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "10m",
  });
  return { accessToken, refreshToken };
}

export { jwtTokens };
