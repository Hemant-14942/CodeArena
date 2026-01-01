import { Response, Request, NextFunction } from "express";
import User from "../models/user";
import AppError from "../utils/AppError";

import {
  createAccessToken,
  createRefreshToken,
  generateTokenId,
  verifyRefreshToken,
} from "../utils/generateToken";

import { hashToken } from "../utils/hash";
import { verifyPassword, findUserByEmail } from "../services/auth.service";
import {
  saveSession,
  deleteSession,
  deleteAllSessions,
  getSession,
} from "../services/redisSession.service";



/*
  =========================
  REGISTER USER
  =========================
*/
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password, avatar, bio, github, linkedin, website } = req.body;

    if (!username || !email || !password) {
      return next(new AppError("Please fill the required fields", 400));
    }
    const userPayload: any = {
      username,
      email,
      password,
    };


    if (avatar) {
      if (typeof avatar !== "string") {
        return next(new AppError("Avatar must be a string URL", 400));
      }

      if (!avatar.startsWith(process.env.IMAGEKIT_URL_ENDPOINT!)) {
        return next(new AppError("Invalid avatar URL source", 400));
      }
      userPayload.avatar = avatar;
    }
    if(bio){
      userPayload.bio = bio;
    }
    if (github || linkedin || website) {
      userPayload.links = {};
      if (github) userPayload.links.github = github;
      if (linkedin) userPayload.links.linkedin = linkedin;
      if (website) userPayload.links.website = website;
    }   

    const userExists = await findUserByEmail(email);
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const user = await User.create(userPayload);

    const userId = user._id.toString();

    /*
       New device session
    */
    const tokenId = generateTokenId();

    /*
       Create tokens
    */
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId, tokenId);

    /*
       Save refresh session in Redis
      IMPORTANT: hash the REFRESH TOKEN (not tokenId)
    */
    await saveSession(
      userId,
      tokenId,
      hashToken(refreshToken),
      7 * 24 * 60 * 60
    );

    /*
       Send refresh token via httpOnly cookie
    */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    /*
       Send access token in response
    */
    res.status(201).json({
      status: "success",
      accessToken,
      data: {
        _id: userId,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
};

/*
  =========================
  LOGIN USER
  =========================
*/
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new AppError("Credentials do not match", 401));
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return next(new AppError("Credentials do not match", 401));
    }

    const userId = user._id.toString();

    /*
       New device session
    */
    const tokenId = generateTokenId();

    /*
       Create tokens
    */
    const accessToken = createAccessToken(userId);
    const refreshToken = createRefreshToken(userId, tokenId);

    /*
       Save refresh session in Redis
    */
    await saveSession(
      userId,
      tokenId,
      hashToken(refreshToken),
      7 * 24 * 60 * 60
    );

    /*
       Set refresh token cookie
    */
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    /*
       Send access token
    */
    res.status(200).json({
      status: "success",
      accessToken,
      data: {
        _id: userId,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};
/*
  =========================
  LOGOUT (SINGLE DEVICE)
  =========================
  - Deletes current refresh-token session
  - Clears refresh token cookie
*/
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
      1Read refresh token from cookie
    */
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      // Already logged out
      return res.sendStatus(204);
    }

    /*
       Verify refresh token to get session info
    */
    const { sub: userId, jti: tokenId } =
      verifyRefreshToken(refreshToken);

    /*
       Delete ONLY this session from Redis
    */
    await deleteSession(userId, tokenId);

    /*
       Clear cookie
    */
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    /*
       Respond
    */
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
/*
  =========================
  LOGOUT FROM ALL DEVICES
  =========================
  - Deletes ALL refresh-token sessions
  - Forces re-login everywhere
*/
export const logoutAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
      We need userId.
      Best source here is the refresh token cookie.
    */
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.sendStatus(204);
    }

    /*
      Extract userId from refresh token
    */
    const { sub: userId } = verifyRefreshToken(refreshToken);

    /*
      Delete ALL sessions of this user
    */
    await deleteAllSessions(userId);

    /*
      Clear cookie on this device too
    */
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};


/*
  =========================
  REFRESH TOKEN (ROTATION)
  =========================
*/
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
       Read refresh token from cookie
    */
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new AppError("Unauthorized", 401));
    }

    /*
       Verify refresh token cryptographically
       
        This is JavaScript object destructuring with renaming.

        Meaning:

        Take sub from the object → store it in variable userId

        Take jti from the object → store it in variable tokenId

        It is exactly equivalent to:

        const payload = verifyRefreshToken(token);

        const userId = payload.sub;
        const tokenId = payload.jti;


        No difference in behavior.
    */
    const { sub: userId, jti: tokenId } =
      verifyRefreshToken(refreshToken);

    /*
       Check session exists in Redis
    */
    const storedHash = await getSession(userId, tokenId);

    /*
       If session missing OR hash mismatch
         → token reuse / compromised
    */
    if (!storedHash || storedHash !== hashToken(refreshToken)) {
      await deleteAllSessions(userId);
      return next(new AppError("Session compromised", 401));
    }

    /*
       Rotate token
         - delete old session
         - create new session
    */
    await deleteSession(userId, tokenId);

    const newTokenId = generateTokenId();
    const newAccessToken = createAccessToken(userId);
    const newRefreshToken = createRefreshToken(userId, newTokenId);

    await saveSession(
      userId,
      newTokenId,
      hashToken(newRefreshToken),
      7 * 24 * 60 * 60
    );

    /*
       Send new refresh token via cookie
    */
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    /*
       Send new access token
    */
    res.status(200).json({
      status: "success",
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};
