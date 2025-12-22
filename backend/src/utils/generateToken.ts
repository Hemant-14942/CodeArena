import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const createAccessToken = (userId: string) => {
  return jwt.sign(
    { sub: userId },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

export const createRefreshToken = (userId: string, tokenId: string) => {
  return jwt.sign(
    { sub: userId, jti: tokenId },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as {
    sub: string;
    jti: string;
  };
};

 export const generateTokenId = () =>{
   return uuidv4();
 };
