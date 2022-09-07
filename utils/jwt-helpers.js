import jwt from "jsonwebtoken";

function jwtTokens({ user_id, user_name, user_email }) {
  //jwt.sign() argument is token payload
  const user = { user_id, user_name, user_email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });

  console.log(`DATABASE_PASSOWRD = ${process.env.DATABASE_PASSWORD}`);

  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return { accessToken, refreshToken };
}

export { jwtTokens };
