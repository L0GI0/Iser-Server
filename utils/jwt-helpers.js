import jwt from "jsonwebtoken";

function jwtTokens({ user_id, user_name, user_email }) {
  //argument object is token payload
  const user = { user_id, user_name, user_email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "10s",
  });

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "30s",
  });
  return { accessToken, refreshToken };
}

export { jwtTokens };
